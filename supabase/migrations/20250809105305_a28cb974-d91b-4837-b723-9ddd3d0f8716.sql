
-- 1) Optional but recommended: stock movements audit table
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  delta_shelf integer not null default 0,
  delta_warehouse integer not null default 0,
  reason text,
  order_id uuid,
  created_at timestamptz not null default now(),
  created_by uuid
);

-- Enable RLS and allow only admins/developers to view
alter table public.stock_movements enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'stock_movements' and policyname = 'Admins can view stock movements'
  ) then
    create policy "Admins can view stock movements"
      on public.stock_movements
      for select
      using (public.has_role(auth.uid(), 'admin'::user_role) or public.has_role(auth.uid(), 'developer'::user_role));
  end if;
end $$;

-- 2) Core RPC: adjust_product_stock
create or replace function public.adjust_product_stock(
  p_product_id uuid,
  p_delta_shelf integer,
  p_delta_warehouse integer,
  p_reason text default null,
  p_order_id uuid default null,
  p_actor_user_id uuid default null,
  p_adjust_opening boolean default false
)
returns table (
  id uuid,
  shelf_stock integer,
  warehouse_stock integer,
  opening_stock integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_cur_shelf integer;
  v_cur_warehouse integer;
  v_cur_opening integer;
  v_new_shelf integer;
  v_new_warehouse integer;
  v_new_opening integer;
begin
  if p_product_id is null then
    raise exception 'Product id is required';
  end if;

  if coalesce(p_delta_shelf,0) = 0 and coalesce(p_delta_warehouse,0) = 0 then
    raise exception 'At least one of delta_shelf or delta_warehouse must be non-zero';
  end if;

  -- Only admins/developers can call this direct adjust function
  if not (public.has_role(auth.uid(), 'admin'::user_role) or public.has_role(auth.uid(), 'developer'::user_role)) then
    raise exception 'Not authorized';
  end if;

  select coalesce(shelf_stock,0), coalesce(warehouse_stock,0), coalesce(opening_stock,0)
  into v_cur_shelf, v_cur_warehouse, v_cur_opening
  from public.products
  where id = p_product_id;

  if not found then
    raise exception 'Product not found';
  end if;

  v_new_shelf := v_cur_shelf + coalesce(p_delta_shelf,0);
  v_new_warehouse := v_cur_warehouse + coalesce(p_delta_warehouse,0);
  v_new_opening := v_cur_opening + (case when p_adjust_opening and coalesce(p_delta_warehouse,0) > 0 then coalesce(p_delta_warehouse,0) else 0 end);

  if v_new_shelf < 0 then
    raise exception 'Insufficient shelf stock for this operation';
  end if;
  if v_new_warehouse < 0 then
    raise exception 'Insufficient warehouse stock for this operation';
  end if;

  update public.products
  set
    shelf_stock = v_new_shelf,
    warehouse_stock = v_new_warehouse,
    opening_stock = v_new_opening,
    updated_at = now()
  where id = p_product_id
  returning id, shelf_stock, warehouse_stock, opening_stock, updated_at
  into id, shelf_stock, warehouse_stock, opening_stock, updated_at;

  -- Audit log (security definer will insert regardless of RLS; if you want RLS to apply, add an INSERT policy)
  insert into public.stock_movements (product_id, delta_shelf, delta_warehouse, reason, order_id, created_by)
  values (p_product_id, coalesce(p_delta_shelf,0), coalesce(p_delta_warehouse,0), p_reason, p_order_id, coalesce(p_actor_user_id, auth.uid()));

  return;
end;
$$;

revoke all on function public.adjust_product_stock(uuid, integer, integer, text, uuid, uuid, boolean) from public;
grant execute on function public.adjust_product_stock(uuid, integer, integer, text, uuid, uuid, boolean) to authenticated;

comment on function public.adjust_product_stock(uuid, integer, integer, text, uuid, uuid, boolean)
is 'Atomic product stock adjust; admin/dev only; optional opening_stock increment for true warehouse restock.';

-- 3) Order-scoped RPC: apply_order_stock_change
create or replace function public.apply_order_stock_change(
  p_order_id uuid,
  p_action text,
  p_actor_user_id uuid
)
returns table (
  product_id uuid,
  quantity integer,
  new_shelf_stock integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_order_user uuid;
  v_is_admin boolean;
  rec record;
  v_delta_shelf integer;
  v_res record;
begin
  if p_order_id is null then
    raise exception 'Order id is required';
  end if;

  if p_action not in ('reduce','restore') then
    raise exception 'Invalid action. Use reduce or restore';
  end if;

  -- Authorization: admin/dev OR order owner
  select user_id into v_order_user
  from public.orders
  where id = p_order_id;

  if not found then
    raise exception 'Order not found';
  end if;

  v_is_admin := public.has_role(p_actor_user_id, 'admin'::user_role) or public.has_role(p_actor_user_id, 'developer'::user_role);

  if not v_is_admin and p_actor_user_id is distinct from v_order_user then
    raise exception 'Not authorized to modify stock for this order';
  end if;

  -- Loop through items and adjust shelf stock
  for rec in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id
  loop
    if p_action = 'reduce' then
      v_delta_shelf := -rec.quantity;
    else
      v_delta_shelf := rec.quantity;
    end if;

    -- Call core adjust (no opening stock change for order-based movements)
    select id, shelf_stock, updated_at
    into v_res
    from public.adjust_product_stock(
      rec.product_id,
      v_delta_shelf,
      0,
      case when p_action='reduce' then 'order_reduce' else 'order_restore' end,
      p_order_id,
      p_actor_user_id,
      false
    );

    product_id := rec.product_id;
    quantity := rec.quantity;
    new_shelf_stock := v_res.shelf_stock;
    updated_at := v_res.updated_at;
    return next;
  end loop;

  return;
end;
$$;

revoke all on function public.apply_order_stock_change(uuid, text, uuid) from public;
grant execute on function public.apply_order_stock_change(uuid, text, uuid) to authenticated;

comment on function public.apply_order_stock_change(uuid, text, uuid)
is 'Applies reduce/restore on shelf stock for all items of an order. Authorizes by has_role or order ownership.';
