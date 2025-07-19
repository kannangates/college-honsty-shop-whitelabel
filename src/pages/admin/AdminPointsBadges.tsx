import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Trophy, Plus, Pencil, Trash2 } from 'lucide-react';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BadgeCreateCard, BADGE_PRESETS } from './BadgeCreateCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ColumnDef, useReactTable, getCoreRowModel, flexRender, CellContext } from '@tanstack/react-table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Student {
  id: string;
  student_id: string;
  name: string;
  department?: string;
  points: number;
}

// Add types for rules
interface GamificationRule {
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
}

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

const AdminPointsBadges = () => {
  const [pointsConfig, setPointsConfig] = useState({
    immediate: 100,
    within30h: 80,
    within48h: 60,
    within72h: 40,
    after72h: 20
  });

  const [manualAllocation, setManualAllocation] = useState({
    studentId: '',
    points: '',
    reason: ''
  });

  const [badgeConfig, setBadgeConfig] = useState({
    imageUrl: '',
    name: '',
    minPoints: '',
    maxPoints: ''
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);
  const [reasonPopoverOpen, setReasonPopoverOpen] = useState(false);

  // Gamification rules state
  const [rules, setRules] = useState<GamificationRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editRule, setEditRule] = useState<GamificationRule | null>(null);

  const { toast } = useToast();

  const reasons = [
    'Payment Completion',
    'Early Payment Bonus',
    'Manual Adjustment',
    'Contest Winner',
    'Penalty Deduction',
    'Refund Processing'
  ];

  // Fetch students from the users table
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, student_id, name, department, points')
        .eq('role', 'student')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Fetch rules
  const fetchRules = useCallback(async () => {
    setRulesLoading(true);
    const { data, error } = await supabase.from('gamification_rules').select('*').order('created_at', { ascending: false });
    if (!error) setRules(data || []);
    setRulesLoading(false);
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handlePointsConfigChange = (field: string, value: string) => {
    setPointsConfig(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const handleManualAllocationChange = (field: string, value: string) => {
    setManualAllocation(prev => ({ ...prev, [field]: value }));
  };

  const handleBadgeConfigChange = (field: string, value: string) => {
    setBadgeConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePointsConfig = () => {
    console.log('Saving points config:', pointsConfig);
    // Implementation for saving points configuration
  };

  const handleUpdatePoints = async () => {
    if (!manualAllocation.studentId || !manualAllocation.points || !manualAllocation.reason) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const pointsToAdd = parseInt(manualAllocation.points);
      if (isNaN(pointsToAdd)) {
        toast({
          title: 'Invalid Points',
          description: 'Please enter a valid number for points',
          variant: 'destructive',
        });
        return;
      }

      // Find the selected student
      const selectedStudent = students.find(s => s.student_id === manualAllocation.studentId);
      if (!selectedStudent) {
        toast({
          title: 'Student Not Found',
          description: 'Selected student not found',
          variant: 'destructive',
        });
        return;
      }

      // Call the Edge Function to update points with proper authentication
      const { data, error } = await supabase.functions.invoke('update-user-points', {
        body: {
          studentId: manualAllocation.studentId,
          points: pointsToAdd,
          reason: manualAllocation.reason
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Points Updated',
          description: `Successfully updated points for ${selectedStudent.name}`,
        });

        // Reset form and refresh students
        setManualAllocation({ studentId: '', points: '', reason: '' });
        await fetchStudents();
      } else {
        throw new Error(data?.error || 'Failed to update points');
      }
    } catch (error) {
      console.error('Error updating points:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update points',
        variant: 'destructive',
      });
    }
  };

  const handleAddBadge = () => {
    console.log('Adding badge:', badgeConfig);
    // Implementation for adding badge
    setBadgeConfig({ imageUrl: '', name: '', minPoints: '', maxPoints: '' });
  };

  // Add/Edit Rule form
  const ruleFormDefault = {
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
  const { register: ruleRegister, handleSubmit: handleRuleSubmit, reset: resetRuleForm, setValue: setRuleValue, formState: { errors: ruleErrors } } = useForm<typeof ruleFormDefault>({
    defaultValues: ruleFormDefault
  });

  const handleOpenAddRule = () => {
    setEditRule(null);
    resetRuleForm();
    setRuleModalOpen(true);
  };
  const handleEditRule = (rule: GamificationRule) => {
    setEditRule(rule);
    setRuleModalOpen(true);
    (Object.keys(ruleFormDefault) as (keyof typeof ruleFormDefault)[]).forEach(key => {
      setRuleValue(key, ((rule as unknown) as Record<string, unknown>)[key] ?? ruleFormDefault[key]);
    });
  };
  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Delete this rule?')) return;
    setRulesLoading(true);
    await supabase.from('gamification_rules').delete().eq('id', id);
    await fetchRules();
    setRulesLoading(false);
  };
  const onSubmitRule: SubmitHandler<typeof ruleFormDefault> = async (values) => {
    setRulesLoading(true);
    if (editRule) {
      await supabase.from('gamification_rules').update(values).eq('id', editRule.id);
    } else {
      await supabase.from('gamification_rules').insert(values);
    }
    setRuleModalOpen(false);
    setEditRule(null);
    resetRuleForm();
    await fetchRules();
    setRulesLoading(false);
  };

  // Table columns for rules
  const ruleColumns: ColumnDef<GamificationRule>[] = [
    { accessorKey: 'event_type', header: 'Event Type' },
    { accessorKey: 'condition_type', header: 'Condition Type' },
    { accessorKey: 'operator', header: 'Operator' },
    { accessorKey: 'condition_value', header: 'Value' },
    { accessorKey: 'label', header: 'Label' },
    { accessorKey: 'points_awarded', header: 'Points' },
    { accessorKey: 'cooldown_seconds', header: 'Cooldown (s)' },
    { accessorKey: 'active', header: 'Active' },
    {
      id: 'actions',
      header: 'Actions',
      cell: (cell: CellContext<GamificationRule, unknown>) => {
        const row = cell.row.original;
        return (
          <div className="flex gap-2 items-center">
            <Button size="icon" variant="outline" onClick={() => handleEditRule(row)} aria-label="Edit Rule">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="destructive" onClick={() => handleDeleteRule(row.id)} aria-label="Delete Rule">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      }
    }
  ];
  const ruleTable = useReactTable({
    data: rules,
    columns: ruleColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4 text-sm">
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-4 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Points & Badges</h1>
        <p className="text-purple-100 text-sm">Configure point allocation and badge management</p>
      </div>

      <Tabs defaultValue="points" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="points">Points Configuration</TabsTrigger>
          <TabsTrigger value="badges">Badge Management</TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="space-y-4">
          {/* Manual Points Allocation */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5" />
                Manual Points Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="studentSelect" className="text-xs">Select Student</Label>
                  <Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-full h-8 border border-input bg-background rounded-md px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          !manualAllocation.studentId && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        {loading ? "Loading students..." : 
                         manualAllocation.studentId ? 
                         students.find(s => s.student_id === manualAllocation.studentId)?.name || "Select student" :
                         "Select student"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search student..." />
                        <CommandList>
                          <CommandEmpty>No student found.</CommandEmpty>
                          {students.map((student) => (
                            <CommandItem
                              key={student.student_id}
                              value={`${student.name} ${student.student_id} ${student.department || ''}`}
                              onSelect={() => {
                                handleManualAllocationChange('studentId', student.student_id);
                                setStudentPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  manualAllocation.studentId === student.student_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{student.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {student.student_id} • {student.department || 'No Department'} • {student.points || 0} pts
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="manualPoints" className="text-xs">Enter Points</Label>
                  <Input
                    id="manualPoints"
                    type="number"
                    value={manualAllocation.points}
                    onChange={(e) => handleManualAllocationChange('points', e.target.value)}
                    placeholder="Enter points (+ or -)"
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="reason" className="text-xs">Choose Reason</Label>
                  <Popover open={reasonPopoverOpen} onOpenChange={setReasonPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-full h-8 border border-input bg-background rounded-md px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          !manualAllocation.reason && "text-muted-foreground"
                        )}
                      >
                        {manualAllocation.reason || "Select reason"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search reason..." />
                        <CommandList>
                          <CommandEmpty>No reason found.</CommandEmpty>
                          {reasons.map((reason) => (
                            <CommandItem
                              key={reason}
                              value={reason}
                              onSelect={() => {
                                handleManualAllocationChange('reason', reason);
                                setReasonPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  manualAllocation.reason === reason ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {reason}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button onClick={handleUpdatePoints} className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                Update Points
              </Button>
            </CardContent>
          </Card>

          {/* Gamification Rules Table & Add Rule Button */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5" />
                Gamification Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleOpenAddRule} className="mb-4">Add Rule</Button>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    {ruleTable.getHeaderGroups().map(headerGroup => (
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
                    {ruleTable.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="border px-2 py-1">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rulesLoading && <div className="text-center py-4">Loading...</div>}
                {!rulesLoading && rules.length === 0 && <div className="text-center py-4">No rules found.</div>}
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Rule Modal */}
          <Dialog open={ruleModalOpen} onOpenChange={setRuleModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editRule ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRuleSubmit(onSubmitRule)} className="space-y-4">
                <div>
                  <label className="block text-xs mb-1">Event Type</label>
                  <select {...ruleRegister('event_type', { required: true })} className="w-full border rounded px-2 py-1">
                    <option value="">Select event</option>
                    {EVENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  {ruleErrors.event_type && <span className="text-xs text-red-500">Required</span>}
                </div>
                <div>
                  <label className="block text-xs mb-1">Condition Type</label>
                  <select {...ruleRegister('condition_type', { required: true })} className="w-full border rounded px-2 py-1">
                    <option value="">Select condition</option>
                    {CONDITION_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {ruleErrors.condition_type && <span className="text-xs text-red-500">Required</span>}
                </div>
                <div>
                  <label className="block text-xs mb-1">Operator</label>
                  <select {...ruleRegister('operator', { required: true })} className="w-full border rounded px-2 py-1">
                    <option value="">Select operator</option>
                    {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {ruleErrors.operator && <span className="text-xs text-red-500">Required</span>}
                </div>
                <div>
                  <label className="block text-xs mb-1">Condition Value</label>
                  <Input {...ruleRegister('condition_value', { required: true })} className="w-full" />
                  {ruleErrors.condition_value && <span className="text-xs text-red-500">Required</span>}
                </div>
                <div>
                  <label className="block text-xs mb-1">Label</label>
                  <Input {...ruleRegister('label')} className="w-full" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Points Awarded</label>
                  <Input type="number" {...ruleRegister('points_awarded', { required: true, valueAsNumber: true })} className="w-full" />
                  {ruleErrors.points_awarded && <span className="text-xs text-red-500">Required</span>}
                </div>
                <div>
                  <Label htmlFor="cooldown_seconds" className="text-xs flex items-center gap-1">
                    Cooldown (seconds)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 cursor-pointer">🛈</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        The minimum time (in seconds) that must pass before this rule can be triggered again for the same user.
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="cooldown_seconds"
                    type="number"
                    {...ruleRegister('cooldown_seconds')}
                    className="text-sm h-8"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...ruleRegister('active')} checked={!!(editRule ? editRule.active : true)} onChange={e => setRuleValue('active', e.target.checked)} />
                  <span>Active</span>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={rulesLoading}>{editRule ? 'Update' : 'Create'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setRuleModalOpen(false); setEditRule(null); resetRuleForm(); }}>Cancel</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="badges">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5" />
                Badge Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="badgeImage" className="text-xs">Badge Image URL</Label>
                  <Input
                    id="badgeImage"
                    value={badgeConfig.imageUrl}
                    onChange={(e) => handleBadgeConfigChange('imageUrl', e.target.value)}
                    placeholder="Enter badge image URL"
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="badgeName" className="text-xs">Badge Name</Label>
                  <Input
                    id="badgeName"
                    value={badgeConfig.name}
                    onChange={(e) => handleBadgeConfigChange('name', e.target.value)}
                    placeholder="Enter badge name"
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="minPoints" className="text-xs">Minimum Points</Label>
                  <Input
                    id="minPoints"
                    type="number"
                    value={badgeConfig.minPoints}
                    onChange={(e) => handleBadgeConfigChange('minPoints', e.target.value)}
                    placeholder="Minimum points required"
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="maxPoints" className="text-xs">Maximum Points</Label>
                  <Input
                    id="maxPoints"
                    type="number"
                    value={badgeConfig.maxPoints}
                    onChange={(e) => handleBadgeConfigChange('maxPoints', e.target.value)}
                    placeholder="Maximum points (optional)"
                    className="text-sm h-8"
                  />
                </div>
              </div>

              <Button onClick={handleAddBadge} className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white text-sm">
                Add Badge
              </Button>

              {/* Existing Badges Display */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Existing Badges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-3 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Award className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h4 className="text-sm font-medium">Bronze Badge</h4>
                    <p className="text-xs text-gray-500">0-100 points</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Award className="h-8 w-8 text-gray-600" />
                    </div>
                    <h4 className="text-sm font-medium">Silver Badge</h4>
                    <p className="text-xs text-gray-500">101-500 points</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h4 className="text-sm font-medium">Gold Badge</h4>
                    <p className="text-xs text-gray-500">501+ points</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="mt-8">
        <CardHeader>
          <CardTitle>Badge Creation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <BadgeCreateCard />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Badge Presets</h3>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              {BADGE_PRESETS.map((b, i) => (
                <li key={i}>
                  <span className="font-medium">{b.name}</span>: {b.description} (Criteria: {b.criteria_type} {b.criteria_value})
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPointsBadges;
