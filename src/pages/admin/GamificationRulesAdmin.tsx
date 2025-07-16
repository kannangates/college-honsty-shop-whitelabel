import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { createClient } from '@supabase/supabase-js';
import { ColumnDef, useReactTable, getCoreRowModel, flexRender, CellContext } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const EVENT_TYPES = [
  'PAYMENT_RECORDED',
  'ORDER_PAID',
  'MANUAL_REWARD',
  // Add more as needed
];

const CONDITION_TYPES = [
  'delay_minutes',
  'delay_hours',
  'streak_paid_orders',
  'amount_paid',
  'reason',
  // Add more as needed
];

const OPERATORS = ['<=', '>=', '==', '>', '<'];

const DEFAULT_RULES = [
  { event_type: "PAYMENT_RECORDED", condition_type: "delay_minutes", operator: "<=", condition_value: "30", label: "Paid within 30 mins", points_awarded: 10 },
  { event_type: "PAYMENT_RECORDED", condition_type: "delay_hours", operator: "<=", condition_value: "24", label: "Paid within 24 hrs", points_awarded: 7 },
  { event_type: "PAYMENT_RECORDED", condition_type: "delay_hours", operator: "<=", condition_value: "48", label: "Paid within 48 hrs", points_awarded: 5 },
  { event_type: "PAYMENT_RECORDED", condition_type: "delay_hours", operator: ">", condition_value: "72", label: "Paid after 3 days", points_awarded: 1 },
  { event_type: "ORDER_PAID", condition_type: "streak_paid_orders", operator: ">=", condition_value: "3", label: "3 paid orders in a row", points_awarded: 20 },
  { event_type: "ORDER_PAID", condition_type: "streak_paid_orders", operator: ">=", condition_value: "5", label: "5 paid orders in a row", points_awarded: 35 },
  { event_type: "ORDER_PAID", condition_type: "amount_paid", operator: ">=", condition_value: "500", label: "Spent ₹500 or more", points_awarded: 15 },
  { event_type: "ORDER_PAID", condition_type: "order_count", operator: ">=", condition_value: "10", label: "10 total paid orders", points_awarded: 25 },
  { event_type: "MANUAL_REWARD", condition_type: "reason", operator: "==", condition_value: "CONTEST_WINNER", label: "Contest Winner", points_awarded: 50 },
  { event_type: "MANUAL_REWARD", condition_type: "reason", operator: "==", condition_value: "EARLY_PAYMENT_BONUS", label: "Early Payment Bonus", points_awarded: 10 },
  { event_type: "MANUAL_REWARD", condition_type: "reason", operator: "==", condition_value: "PENALTY_DEDUCTION", label: "Penalty Deduction", points_awarded: -10 },
  { event_type: "MANUAL_REWARD", condition_type: "reason", operator: "==", condition_value: "REFUND_PROCESSED", label: "Refund Processed", points_awarded: -5 },
  { event_type: "ORDER_PLACED", condition_type: "order_count", operator: ">=", condition_value: "5", label: "Placed 5 orders", points_awarded: 15 },
  { event_type: "PROFILE_COMPLETED", condition_type: "profile_fields_completed", operator: "==", condition_value: "true", label: "Completed profile", points_awarded: 10 },
  { event_type: "ORDER_PAID", condition_type: "amount_paid", operator: ">=", condition_value: "100", label: "Paid ₹100 or more", points_awarded: 5 },
  { event_type: "ORDER_PAID", condition_type: "amount_paid", operator: ">=", condition_value: "500", label: "Paid ₹500 or more", points_awarded: 15 },
  { event_type: "ORDER_PAID", condition_type: "streak_paid_orders", operator: ">=", condition_value: "3", label: "3 consecutive paid orders", points_awarded: 20 },
  { event_type: "ORDER_PAID", condition_type: "streak_paid_orders", operator: ">=", condition_value: "5", label: "5 consecutive paid orders", points_awarded: 35 },
  { event_type: "PAYMENT_RECORDED", condition_type: "delay_minutes", operator: "<=", condition_value: "30", label: "Paid within 30 minutes", points_awarded: 10 },
  { event_type: "PAYMENT_RECORDED", condition_type: "delay_hours", operator: "<=", condition_value: "24", label: "Paid within 24 hours", points_awarded: 7 },
  { event_type: "PAYMENT_RECORDED", condition_type: "delay_hours", operator: "<=", condition_value: "48", label: "Paid within 48 hours", points_awarded: 5 },
  { event_type: "PAYMENT_RECORDED", condition_type: "delay_hours", operator: ">", condition_value: "72", label: "Paid after 3 days", points_awarded: 1 }
];

const BADGE_DEFINITIONS = [
  { name: "Honest Rookie", criteria_type: "xp_threshold", criteria_value: 50, description: "Earn 50 XP total" },
  { name: "Consistent Champ", criteria_type: "streak_paid_orders", criteria_value: 3, description: "3+ paid orders in a row" },
  { name: "Timely Titan", criteria_type: "early_payments", criteria_value: 5, description: "Paid within 30 mins, 5 times" },
  { name: "Order Marathoner", criteria_type: "orders_count", criteria_value: 10, description: "10 total paid orders" },
  { name: "High Roller", criteria_type: "amount_paid_total", criteria_value: 1000, description: "Spent over ₹1000" },
  { name: "Legend of the Dept", criteria_type: "top_rank_department", criteria_value: 1, description: "Top XP in department" },
  { name: "All Badge Collector", criteria_type: "badges_unlocked", criteria_value: 5, description: "Earned 5 different badges" },
  { name: "Profile Pro", criteria_type: "profile_fields_completed", criteria_value: 1, description: "Completed all profile fields" },
  { name: "Order Initiator", criteria_type: "order_count", criteria_value: 5, description: "Placed 5 orders" },
  { name: "Streak Sprinter", criteria_type: "streak_paid_orders", criteria_value: 3, description: "3 paid orders in a row" },
  { name: "Streak Master", criteria_type: "streak_paid_orders", criteria_value: 5, description: "5 paid orders in a row" },
  { name: "Timely Titan", criteria_type: "early_payments", criteria_value: 5, description: "Paid within 30 minutes 5 times" },
  { name: "High Roller", criteria_type: "amount_paid_total", criteria_value: 1000, description: "Spent over ₹1000 total" },
  { name: "XP Achiever", criteria_type: "xp_threshold", criteria_value: 100, description: "Earned 100 XP total" }
];

type Badge = {
  id: string;
  name: string;
  icon_url?: string;
  description?: string;
};
type GamificationRule = {
  id: string;
  event_type: string;
  condition_type: string;
  operator: string;
  condition_value: string;
  label?: string;
  points_awarded: number;
  cooldown_seconds?: number;
  active: boolean;
  badge_id?: string;
  created_at?: string;
};

export default function GamificationRulesAdmin() {
  const [rules, setRules] = useState<GamificationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editRule, setEditRule] = useState<GamificationRule | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);

  const fetchRules = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('gamification_rules').select('*').order('created_at', { ascending: false });
    if (!error) setRules(data || []);
    setLoading(false);
  };

  // On mount, ensure default rules exist
  useEffect(() => {
    const ensureDefaultRules = async () => {
      setLoading(true);
      const existing = await supabase.from('gamification_rules').select('event_type,condition_type,operator,condition_value');
      const existingSet = new Set((existing.data || []).map(r => `${r.event_type}|${r.condition_type}|${r.operator}|${r.condition_value}`));
      const toInsert = DEFAULT_RULES.filter(r => !existingSet.has(`${r.event_type}|${r.condition_type}|${r.operator}|${r.condition_value}`));
      if (toInsert.length > 0) {
        await supabase.from('gamification_rules').insert(toInsert);
      }
      await fetchRules();
      setLoading(false);
    };
    ensureDefaultRules();
  }, []);

  // Fetch badges for linking
  useEffect(() => {
    const fetchBadges = async () => {
      const { data } = await supabase.from('badges').select('id, name, icon_url');
      setBadges(data || []);
    };
    fetchBadges();
  }, []);

  const formDefaultValues = {
    event_type: '',
    condition_type: '',
    operator: '',
    condition_value: '',
    label: '',
    points_awarded: 0,
    cooldown_seconds: undefined,
    active: true,
    badge_id: '',
  };
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<typeof formDefaultValues>({
    defaultValues: formDefaultValues
  });

  const onSubmit: SubmitHandler<typeof formDefaultValues> = async (values) => {
    setLoading(true);
    if (editRule) {
      await supabase.from('gamification_rules').update(values).eq('id', editRule.id);
    } else {
      await supabase.from('gamification_rules').insert(values);
    }
    setOpen(false);
    setEditRule(null);
    reset();
    await fetchRules();
    setLoading(false);
  };

  const handleEdit = (rule: GamificationRule) => {
    setEditRule(rule);
    setOpen(true);
    // Only set values for fields in formDefaultValues
    (Object.keys(formDefaultValues) as (keyof typeof formDefaultValues)[]).forEach(key => {
      setValue(key, (rule as Record<string, unknown>)[key] ?? formDefaultValues[key]);
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this rule?')) return;
    setLoading(true);
    await supabase.from('gamification_rules').delete().eq('id', id);
    await fetchRules();
    setLoading(false);
  };

  const columns: ColumnDef<GamificationRule>[] = [
    { accessorKey: 'event_type' as const, header: 'Event Type' },
    { accessorKey: 'condition_type' as const, header: 'Condition Type' },
    { accessorKey: 'operator' as const, header: 'Operator' },
    { accessorKey: 'condition_value' as const, header: 'Value' },
    { accessorKey: 'label' as const, header: 'Label' },
    { accessorKey: 'points_awarded' as const, header: 'Points' },
    { accessorKey: 'cooldown_seconds' as const, header: 'Cooldown (s)' },
    { accessorKey: 'active' as const, header: 'Active', cell: (cell: CellContext<GamificationRule, unknown>) => cell.row.original.active ? 'Yes' : 'No' },
    {
      accessorKey: 'badge_id' as const,
      header: 'Linked Badge',
      cell: (cell: CellContext<GamificationRule, unknown>) => {
        const badge = badges.find(b => b.id === cell.row.original.badge_id);
        return badge ? (
          <span className="flex items-center gap-1">
            {badge.icon_url && <img src={badge.icon_url} alt="icon" className="w-5 h-5 inline-block rounded-full" />}
            {badge.name}
          </span>
        ) : <span className="text-xs text-gray-400">None</span>;
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (cell: CellContext<GamificationRule, unknown>) => {
        const row = cell.row.original;
        const isDefault = DEFAULT_RULES.some(r =>
          r.event_type === row.event_type &&
          r.condition_type === row.condition_type &&
          r.operator === row.operator &&
          r.condition_value === row.condition_value
        );
        return (
          <div className="flex gap-2 items-center">
            <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>Edit</Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)} disabled={isDefault}>Delete</Button>
            {isDefault && <span className="text-xs text-blue-600 ml-1">System Rule</span>}
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: rules,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isPointsConfigRule = (rule: Partial<GamificationRule> | null) =>
    rule && rule.event_type === 'PAYMENT_RECORDED' &&
    (rule.condition_type === 'delay_minutes' || rule.condition_type === 'delay_hours');

  const handleBulkAdd = async () => {
    setLoading(true);
    // Only insert rules that don't already exist (by event_type, condition_type, operator, condition_value)
    const existing = await supabase.from('gamification_rules').select('event_type,condition_type,operator,condition_value');
    const existingSet = new Set((existing.data || []).map(r => `${r.event_type}|${r.condition_type}|${r.operator}|${r.condition_value}`));
    const toInsert = DEFAULT_RULES.filter(r => !existingSet.has(`${r.event_type}|${r.condition_type}|${r.operator}|${r.condition_value}`));
    if (toInsert.length > 0) {
      await supabase.from('gamification_rules').insert(toInsert);
      await fetchRules();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gamification Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => { setOpen(true); setEditRule(null); reset(); }} className="mb-4">Add Rule</Button>
          {/* Show a summary of default rules */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Default Gamification Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                {DEFAULT_RULES.map((r, i) => (
                  <li key={i}>
                    <span className="font-medium">{r.label}</span> ({r.event_type}, {r.condition_type} {r.operator} {r.condition_value})
                    {isPointsConfigRule(r) && <span className="ml-2 text-xs text-blue-600">(Points managed in Points & Badges page)</span>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="border px-2 py-1 bg-gray-50 text-left">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="border px-2 py-1">
                        {flexRender(cell.column.columnDef.cell || cell.column.columnDef.header, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <div className="text-center py-4">Loading...</div>}
            {!loading && rules.length === 0 && <div className="text-center py-4">No rules found.</div>}
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRule ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs mb-1">Event Type</label>
              <select {...register('event_type', { required: true })} className="w-full border rounded px-2 py-1">
                <option value="">Select event</option>
                {EVENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              {errors.event_type && <span className="text-xs text-red-500">Required</span>}
            </div>
            <div>
              <label className="block text-xs mb-1">Condition Type</label>
              <select {...register('condition_type', { required: true })} className="w-full border rounded px-2 py-1">
                <option value="">Select condition</option>
                {CONDITION_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.condition_type && <span className="text-xs text-red-500">Required</span>}
            </div>
            <div>
              <label className="block text-xs mb-1">Operator</label>
              <select {...register('operator', { required: true })} className="w-full border rounded px-2 py-1">
                <option value="">Select operator</option>
                {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {errors.operator && <span className="text-xs text-red-500">Required</span>}
            </div>
            <div>
              <label className="block text-xs mb-1">Condition Value</label>
              <Input {...register('condition_value', { required: true })} className="w-full" />
              {errors.condition_value && <span className="text-xs text-red-500">Required</span>}
            </div>
            <div>
              <label className="block text-xs mb-1">Label</label>
              <Input {...register('label')} className="w-full" />
            </div>
            <div>
              <label className="block text-xs mb-1">Points Awarded</label>
              <Input type="number" {...register('points_awarded', { required: true, valueAsNumber: true })} className="w-full" disabled={isPointsConfigRule(editRule)} />
              {isPointsConfigRule(editRule) && <span className="text-xs text-blue-600">Points managed in Points & Badges page</span>}
              {errors.points_awarded && <span className="text-xs text-red-500">Required</span>}
            </div>
            <div>
              <label className="block text-xs mb-1">Cooldown (seconds)</label>
              <Input type="number" {...register('cooldown_seconds', { valueAsNumber: true })} className="w-full" />
            </div>
            <div>
              <label className="block text-xs mb-1">Linked Badge</label>
              <select {...register('badge_id')} className="w-full border rounded px-2 py-1">
                <option value="">None</option>
                {badges.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={!!(editRule ? editRule.active : true)} {...register('active')} />
              <span>Active</span>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>{editRule ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditRule(null); reset(); }}>Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Badge Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            {BADGE_DEFINITIONS.map((b, i) => (
              <li key={i}>
                <span className="font-medium">{b.name}</span>: {b.description} (Criteria: {b.criteria_type} {b.criteria_value})
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <BadgeCreateCard />
    </div>
  );
}

const badgeColors = [
  'from-pink-400 to-yellow-300',
  'from-blue-400 to-green-300',
  'from-purple-400 to-pink-300',
  'from-yellow-400 to-orange-300',
  'from-green-400 to-blue-300',
  'from-red-400 to-pink-300',
];
function getRandomColor() {
  return badgeColors[Math.floor(Math.random() * badgeColors.length)];
}
type BadgeForm = {
  name: string;
  description?: string;
  icon_url?: string;
  criteria_type: string;
  criteria_value: string;
};
function BadgeCreateCard() {
  const { register, handleSubmit, reset } = useForm<BadgeForm>();
  const [color, setColor] = useState(getRandomColor());
  const [loading, setLoading] = useState(false);
  const onSubmit = async (values: BadgeForm) => {
    setLoading(true);
    await supabase.from('badges').insert({
      name: values.name,
      description: values.description,
      icon_url: values.icon_url,
      criteria_type: values.criteria_type,
      criteria_value: values.criteria_value,
      created_at: new Date().toISOString(),
      is_active: true
    });
    reset();
    setColor(getRandomColor());
    setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`rounded-xl p-6 shadow-lg bg-gradient-to-r ${color} text-white mb-6`}>
      <div className="flex items-center gap-3 mb-2">
        <input {...register('icon_url')} placeholder="Icon URL or Emoji" className="rounded px-2 py-1 text-black" />
        <input {...register('name', { required: true })} placeholder="Badge Title" className="rounded px-2 py-1 text-black" />
      </div>
      <textarea {...register('description')} placeholder="Description" className="rounded px-2 py-1 w-full text-black mb-2" />
      <div className="flex gap-2 mb-2">
        <input {...register('criteria_type', { required: true })} placeholder="Criteria Type (e.g. xp_threshold)" className="rounded px-2 py-1 text-black" />
        <input {...register('criteria_value', { required: true })} placeholder="Value" className="rounded px-2 py-1 text-black" />
      </div>
      <Button type="submit" disabled={loading}>Create Badge</Button>
    </form>
  );
} 