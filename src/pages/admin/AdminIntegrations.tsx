
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Mail, CreditCard, Webhook, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { EmailService } from '@/services/emailService';

export default function AdminIntegrations() {

  // Email Test Form Component
  function EmailTestForm() {
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('Test Email from College Honesty Shop');
    const [message, setMessage] = useState('This is a test email to verify that your email service is working correctly.');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;

      setIsSending(true);
      try {
        await EmailService.sendTestEmail(email, subject, message);
      } finally {
        setIsSending(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Recipient Email</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="recipient@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-subject">Subject</Label>
          <Input
            id="email-subject"
            type="text"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-message">Message</Label>
          <Textarea
            id="email-message"
            placeholder="Your test message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSending || !email}>
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          <p>Note: This will send a real email to the specified address. Use with caution.</p>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Integration Settings</h1>
            <p className="text-purple-100">Configure payment gateways, email services, and n8n automation</p>
          </div>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-lg font-bold text-blue-800">Payment Gateway</div>
            <div className="text-sm text-blue-600">Razorpay Integration</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-lg font-bold text-green-800">Email Service</div>
            <div className="text-sm text-green-600">Gmail Integration</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <Webhook className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-lg font-bold text-purple-800">n8n Automation</div>
            <div className="text-sm text-purple-600">Workflow Automation</div>
          </CardContent>
        </Card>
      </div>

      {/* n8n Automation Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>n8n Automation</CardTitle>
              <CardDescription>Configure and manage n8n workflow automation</CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link to="/admin/n8n">
                <Webhook className="mr-2 h-4 w-4" />
                Manage n8n Settings
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Configure webhooks for points automation, badge awards, notifications, and analytics.
            Click the button above to manage all n8n automation settings.
          </p>
        </CardContent>
      </Card>

      {/* Email Test Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Email Test</CardTitle>
              <CardDescription>Test your email service configuration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EmailTestForm />
        </CardContent>
      </Card>

      {/* Payment Gateway Automation Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment Gateway Automation</CardTitle>
              <CardDescription>Configure and manage payment gateway settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Coming Soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
