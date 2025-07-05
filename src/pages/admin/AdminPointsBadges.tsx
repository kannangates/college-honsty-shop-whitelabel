import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Trophy, Plus } from 'lucide-react';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const reasons = [
    'Payment Completion',
    'Early Payment Bonus',
    'Manual Adjustment',
    'Contest Winner',
    'Penalty Deduction',
    'Refund Processing'
  ];

  const STUDENTS = [
    { value: '569', label: '569 - Radhika' },
    { value: '570', label: '570 - John Doe' },
    { value: '571', label: '571 - Jane Smith' },
  ];

  const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);
  const [reasonPopoverOpen, setReasonPopoverOpen] = useState(false);

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

  const handleUpdatePoints = () => {
    console.log('Updating points:', manualAllocation);
    // Implementation for manual points allocation
    setManualAllocation({ studentId: '', points: '', reason: '' });
  };

  const handleAddBadge = () => {
    console.log('Adding badge:', badgeConfig);
    // Implementation for adding badge
    setBadgeConfig({ imageUrl: '', name: '', minPoints: '', maxPoints: '' });
  };

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
          {/* Order-Based Points Configuration */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5" />
                Order-Based Points Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-gray-600 mb-4">Configure points based on payment timing after order creation</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="immediate" className="text-xs">Immediate Payment (Pay Now)</Label>
                  <Input
                    id="immediate"
                    type="number"
                    value={pointsConfig.immediate}
                    onChange={(e) => handlePointsConfigChange('immediate', e.target.value)}
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="within30h" className="text-xs">Within 30 hours</Label>
                  <Input
                    id="within30h"
                    type="number"
                    value={pointsConfig.within30h}
                    onChange={(e) => handlePointsConfigChange('within30h', e.target.value)}
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="within48h" className="text-xs">Within 48 hours</Label>
                  <Input
                    id="within48h"
                    type="number"
                    value={pointsConfig.within48h}
                    onChange={(e) => handlePointsConfigChange('within48h', e.target.value)}
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="within72h" className="text-xs">Within 72 hours</Label>
                  <Input
                    id="within72h"
                    type="number"
                    value={pointsConfig.within72h}
                    onChange={(e) => handlePointsConfigChange('within72h', e.target.value)}
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="after72h" className="text-xs">After 72 hours</Label>
                  <Input
                    id="after72h"
                    type="number"
                    value={pointsConfig.after72h}
                    onChange={(e) => handlePointsConfigChange('after72h', e.target.value)}
                    className="text-sm h-8"
                  />
                </div>
              </div>

              <Button onClick={handleSavePointsConfig} className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white text-sm">
                Save Points Configuration
              </Button>
            </CardContent>
          </Card>

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
                  <Label htmlFor="studentSelect" className="text-xs">Select Student ID</Label>
                  <Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-full h-8 border border-input bg-background rounded-md px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          !manualAllocation.studentId && "text-muted-foreground"
                        )}
                      >
                        {STUDENTS.find(s => s.value === manualAllocation.studentId)?.label || "Select student"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search student..." />
                        <CommandList>
                          <CommandEmpty>No student found.</CommandEmpty>
                          {STUDENTS.map((student) => (
                            <CommandItem
                              key={student.value}
                              value={student.label}
                              onSelect={() => {
                                handleManualAllocationChange('studentId', student.value);
                                setStudentPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  manualAllocation.studentId === student.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {student.label}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPointsBadges;
