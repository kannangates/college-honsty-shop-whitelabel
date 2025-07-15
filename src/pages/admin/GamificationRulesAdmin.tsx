import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '@supabase/supabase-js';
import { ColumnDef, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
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

export default function GamificationRulesAdmin() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editRule, setEditRule] = useState<any | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('gamification_rules').select('*').order('created_at', { ascending: false });
    if (!error) setRules(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRules(); }, []);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      event_type: '',
      condition_type: '',
      operator: '',
      condition_value: '',
      label: '',
      points_awarded: 0,
      cooldown_seconds: undefined,
      active: true,
    }
  });

  const onSubmit = async (values: any) => {
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

  const handleEdit = (rule: any) => {
    setEditRule(rule);
    setOpen(true);
    Object.keys(rule).forEach(key => setValue(key, rule[key]));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this rule?')) return;
    setLoading(true);
    await supabase.from('gamification_rules').delete().eq('id', id);
    await fetchRules();
    setLoading(false);
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'event_type', header: 'Event Type' },
    { accessorKey: 'condition_type', header: 'Condition Type' },
    { accessorKey: 'operator', header: 'Operator' },
    { accessorKey: 'condition_value', header: 'Value' },
    { accessorKey: 'label', header: 'Label' },
    { accessorKey: 'points_awarded', header: 'Points' },
    { accessorKey: 'cooldown_seconds', header: 'Cooldown (s)' },
    { accessorKey: 'active', header: 'Active', cell: ({ row }) => row.original.active ? 'Yes' : 'No' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(row.original)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original.id)}>Delete</Button>
        </div>
      )
    }
  ];

  const table = useReactTable({
    data: rules,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gamification Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => { setOpen(true); setEditRule(null); reset(); }} className="mb-4">Add Rule</Button>
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
              <Input type="number" {...register('points_awarded', { required: true, valueAsNumber: true })} className="w-full" />
              {errors.points_awarded && <span className="text-xs text-red-500">Required</span>}
            </div>
            <div>
              <label className="block text-xs mb-1">Cooldown (seconds)</label>
              <Input type="number" {...register('cooldown_seconds', { valueAsNumber: true })} className="w-full" />
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
    </div>
  );
} 