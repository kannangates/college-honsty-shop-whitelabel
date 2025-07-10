import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DepartmentCombobox from '@/components/ui/DepartmentCombobox';
import { Shield, Users, Package, Settings, Mail, CreditCard, Award, University, Megaphone, ReceiptIndianRupee, ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/hooks/use-toast';

import { BulkUserCreation } from '@/components/admin/BulkUserCreation';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [announcement, setAnnouncement] = useState({
    title: '',
    description: '',
    department: '',
    pinTill: '',
    studentId: ''
  });
  const [announcementSent, setAnnouncementSent] = useState(false);



  const adminSections = [
    {
      title: "Student Management",
      description: "Manage students, roles, and bulk operations",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-violet-100",
      path: "/admin/student-management",
      roles: ['admin', 'developer'],
    },
    {
      title: "Orders Management",
      description: "Track and manage all student orders",
      icon: Package,
      color: "from-green-500 to-green-600", 
      bgColor: "bg-blue-200",
      path: "/admin/order-management",
      roles: ['admin', 'developer'],
    },
    {
      title: "Product & Inventory",
      description: "Manage products, stock levels, and daily inventory",
      icon: Package,
      color: "from-green-500 to-green-600", 
      bgColor: "bg-teal-100",
      path: "/admin/inventory",
      roles: ['admin', 'developer'],
    },
    {
      title: "Integrations",
      description: "Configure Gmail API and Payment gateways",
      icon: Settings,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-200",
      path: "/admin/integrations",
      roles: ['admin', 'developer'],
    },
    {
      title: "n8n Automation",
      description: "Manage n8n workflows and credentials",
      icon: Settings,
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-200",
      path: "/admin/n8n",
      roles: ['admin', 'developer'],
    },
    {
      title: "Points & Badges",
      description: "Configure point allocation and badge management",
      icon: Award,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-100",
      path: "/admin/points-badges",
      roles: ['admin', 'developer'],
    },
    {
      title: "Daily Stock Accounting",
      description: "Information on wasted, closing stock or stolen stock",
      icon: ReceiptText,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-rose-200",
      path: "/admin/stock-accounting",
      roles: ['admin', 'developer'],
    },
    {
      title: "Payment Reports",
      description: "View payment analytics and reports",
      icon: ReceiptIndianRupee,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-green-100",
      path: "/admin/payment-reports",
      roles: ['admin', 'developer'],
    },
    {
      title: "Developer Panel",
      description: "Backend/Tech related info and tools",
      icon: Shield,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-100",
      path: "/admin/dev-tools",
      roles: ['developer'],
    }
  ];

  const handleSendAnnouncement = async () => {
    // Map label to code once here

    // Validation: if Student ID is filled, pinTill must be selected
    if (announcement.studentId.trim() && !announcement.pinTill.trim()) {
      alert("Please select 'Pin notification till date' when targeting a specific student.");
      return;
    }
    
    console.log('Sending announcement:', announcement);

    try {
      const deptCode = deptCodeFromLabel[announcement.department] || announcement.department;
      // Create notification record with proper typing
      const notificationData = {
        title: announcement.title,
        body: announcement.description,
        type: 'announcement' as const, // Explicitly type as 'announcement'
        

        target_user_id: announcement.studentId.trim() || null,

        is_pinned: announcement.pinTill ? true : false,
        department: deptCode === 'all' ? null : [deptCode],
        pin_till: announcement.pinTill || null
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData) // Remove array wrapper - insert single object
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        toast({
          title: 'Error',
          description: 'Failed to send announcement',
          variant: 'destructive',
        });
        return;
      }

      console.log('Notification created:', data);
      console.log("User from context:", user);

      // Show success
      setAnnouncementSent(true);
      toast({
        title: 'Success',
        description: 'Announcement sent successfully!',
      });

      // Clear announcement and close dialog after short delay
      setTimeout(() => {
        setAnnouncementDialogOpen(false);
        setAnnouncementSent(false);
        setAnnouncement({ title: '', description: '', department: '', pinTill: '', studentId: '' });
      }, 1500);
    } catch (error) {
      console.error('Error in handleSendAnnouncement:', error);
      toast({
        title: 'Error',
        description: 'Failed to send announcement',
        variant: 'destructive',
      });
    }
  };

  // Fix the role filtering - use profile.role instead of user.role
  console.log("Profile role:", profile?.role);
  console.log("Profile object:", profile);

  // map label (combobox value) -> code used in DB
  const deptCodeFromLabel: Record<string,string> = {
    'All Department': 'all',
    'All Departments': 'all',
    'Computer Science': 'computer_science',
    'Information Technology': 'information_technology',
    'Electronics': 'electronics',
    'Electronics & Communication': 'electronics',
    'Mechanical': 'mechanical',
    'Mechanical Engineering': 'mechanical',
  };

  return (
    <div className="space-y-4 text-sm text-left">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-4 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Admin Panel
        </h1>
        <p className="text-purple-100 text-sm">Manage all aspects of the Honesty Store system</p>
      </div>

      {/* Admin Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminSections
          .filter(section => {
            if (!section.roles || section.roles.length === 0) return true;
            return profile?.role && section.roles.includes(profile.role);
          })
          .map((section, index) => (
            <Card 
              key={index} 
              className={`border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer ${section.bgColor}`}
              onClick={() => navigate(section.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full bg-gradient-to-r ${section.color} text-white`}>
                    <section.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-gray-800 text-lg text-left">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="mb-3 text-sm text-left">{section.description}</CardDescription>
                <Button className="w-full bg-gradient-to-r from-[#202072] to-[#e66166] text-white text-sm">
                  Manage
                </Button>
              </CardContent>
            </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Quick Announcements */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />  
              Quick Announcements
            </CardTitle>
            <CardDescription className="text-sm">Send notifications to all students</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
                  <Megaphone className="h-4 w-4 mr-1" />
                  Make Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="text-sm">
                <DialogHeader>
                  <DialogTitle>Make Announcement</DialogTitle>
                  <DialogDescription>
                    Send a notification to all students or specific department
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-xs">Title</Label>
                    <Input
                      id="title"
                      value={announcement.title}
                      onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                      placeholder="Enter announcement title"
                      className="text-sm h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-xs">Description</Label>
                    <Textarea
                      id="description"
                      value={announcement.description}
                      onChange={(e) => setAnnouncement({...announcement, description: e.target.value})}
                      placeholder="Enter announcement description"
                      className="text-sm"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentId" className="text-xs">Student ID</Label>
                    <Input
                      id="studentId"
                      type="text"
                      value={announcement.studentId}
                      onChange={(e) => {
                        const studentId = e.target.value;
                        setAnnouncement(prev => ({
                          ...prev,
                          studentId,
                          department: studentId.trim() !== '' ? '' : prev.department,
                        }));
                      }}
                      placeholder="Enter student ID (optional)"
                      className="text-sm h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department" className="text-xs">Target Department</Label>
                    <DepartmentCombobox
                      value={announcement.department}
                      onChange={(label) => {
                        setAnnouncement({ ...announcement, department: label });
                      }}
                      disabled={announcement.studentId.trim() !== ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pinTill" className="text-xs">Pin notification till date</Label>
                    <Input
                      id="pinTill"
                      type="date"
                      value={announcement.pinTill}
                      onChange={(e) => setAnnouncement({ ...announcement, pinTill: e.target.value })}
                      className="text-sm h-8"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setAnnouncementDialogOpen(false)}
                      className="text-sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSendAnnouncement}
                      className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white text-sm"
                    >
                      Send Announcement
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
          {announcementSent && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 text-sm rounded shadow-sm">
              ✅ Announcement sent successfully!
            </div>
          )}
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Coming Soon...
            </CardTitle>
            <CardDescription className="text-sm">Description...</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/admin/reports')}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              Coming Soon...
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
