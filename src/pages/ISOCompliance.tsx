import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, FileCheck, Users, Database, Eye } from 'lucide-react';

const ISOCompliance = () => {
  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">ISO Compliance Documentation</h1>
            <p className="text-purple-100 mt-1">Implementation of international security standards</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="iso27001" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="iso27001">ISO 27001</TabsTrigger>
          <TabsTrigger value="iso27002">ISO 27002</TabsTrigger>
          <TabsTrigger value="iso27017">ISO 27017</TabsTrigger>
        </TabsList>

        {/* ISO 27001 */}
        <TabsContent value="iso27001" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                ISO 27001 - Information Security Management
              </CardTitle>
              <CardDescription>
                Implementation of information security management system (ISMS)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Access Control (A.9)
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>Implementation:</strong> Role-based access control (RBAC) using separate user_roles table</p>
                  <p><strong>Location:</strong> Database table: <code className="bg-muted px-2 py-0.5 rounded">user_roles</code></p>
                  <p><strong>Functions:</strong> <code className="bg-muted px-2 py-0.5 rounded">has_role(user_id, role)</code> security definer function</p>
                  <p><strong>Roles:</strong> Admin, Developer, Teacher, Student with hierarchical permissions</p>
                  <p><strong>Enforcement:</strong> Row-Level Security (RLS) policies on all tables</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Authentication & Authorization (A.9.2)
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>Implementation:</strong> Supabase Auth with Multi-Factor Authentication (MFA)</p>
                  <p><strong>Location:</strong> <code className="bg-muted px-2 py-0.5 rounded">src/hooks/useMFA.ts</code>, <code className="bg-muted px-2 py-0.5 rounded">src/contexts/AuthContext.tsx</code></p>
                  <p><strong>MFA Storage:</strong> Database table: <code className="bg-muted px-2 py-0.5 rounded">user_mfa</code></p>
                  <p><strong>Session Management:</strong> JWT tokens with automatic refresh and secure storage</p>
                  <p><strong>Password Policy:</strong> Enforced complexity requirements with validation triggers</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Cryptography (A.10)
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>Data in Transit:</strong> HTTPS/TLS encryption for all communications</p>
                  <p><strong>Data at Rest:</strong> Supabase PostgreSQL encryption at rest</p>
                  <p><strong>Secrets Management:</strong> Encrypted storage of API keys and sensitive configuration</p>
                  <p><strong>Location:</strong> <code className="bg-muted px-2 py-0.5 rounded">integration_settings</code> table with hashed values</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Logging & Monitoring (A.12.4)
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>Audit Logging:</strong> Comprehensive audit trail for all administrative actions</p>
                  <p><strong>Location:</strong> <code className="bg-muted px-2 py-0.5 rounded">admin_audit_log</code> table, <code className="bg-muted px-2 py-0.5 rounded">src/utils/auditLogger.ts</code></p>
                  <p><strong>Real-time Monitoring:</strong> Real-time updates for new audit entries</p>
                  <p><strong>Captured Data:</strong> User ID, action, table name, IP address, user agent, before/after values</p>
                  <p><strong>Retention:</strong> Indefinite retention with timestamp tracking</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Security Monitoring (A.12.4.1)
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>Performance Monitoring:</strong> Real-time system performance tracking</p>
                  <p><strong>Location:</strong> <code className="bg-muted px-2 py-0.5 rounded">src/utils/performanceMonitor.ts</code>, <code className="bg-muted px-2 py-0.5 rounded">src/hooks/useISOCompliance.ts</code></p>
                  <p><strong>Metrics:</strong> Response time, memory usage, cache hit rate</p>
                  <p><strong>Security Manager:</strong> Session validation and security checks</p>
                  <p><strong>Implementation:</strong> <code className="bg-muted px-2 py-0.5 rounded">src/utils/securityManager.ts</code></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ISO 27002 */}
        <TabsContent value="iso27002" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                ISO 27002 - Code of Practice for Information Security Controls
              </CardTitle>
              <CardDescription>
                Implementation of security controls and best practices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Organizational Controls</h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>5.1 Information Security Policies:</strong> Implemented through RLS policies and access control rules</p>
                  <p><strong>5.2 Information Security Roles:</strong> Defined role hierarchy (Admin → Developer → Teacher → Student)</p>
                  <p><strong>5.3 Segregation of Duties:</strong> Separate tables for user data and roles, security definer functions</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">People Controls</h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>6.1 Screening:</strong> User verification through student ID and email validation</p>
                  <p><strong>6.2 Terms and Conditions:</strong> Acceptance tracked in user creation flow</p>
                  <p><strong>6.3 Information Security Awareness:</strong> Built-in security prompts and validation</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Physical Controls</h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>7.1 Physical Security Perimeters:</strong> Cloud infrastructure (Supabase) with physical security</p>
                  <p><strong>7.2 Physical Entry:</strong> Managed by cloud provider's data center security</p>
                  <p><strong>7.3 Securing Offices:</strong> Not applicable (cloud-based application)</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Technological Controls</h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>8.1 User Endpoint Devices:</strong> Browser-based access with session management</p>
                  <p><strong>8.2 Privileged Access Rights:</strong> Role-based access with admin privileges isolated</p>
                  <p><strong>8.3 Information Access Restriction:</strong> RLS policies enforce data isolation</p>
                  <p><strong>8.4 Source Code Access:</strong> Version controlled, access limited to authorized developers</p>
                  <p><strong>8.5 Secure Authentication:</strong> MFA, JWT tokens, password complexity requirements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ISO 27017 */}
        <TabsContent value="iso27017" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                ISO 27017 - Cloud Security Controls
              </CardTitle>
              <CardDescription>
                Implementation of cloud-specific security controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Cloud Service Provider Responsibilities</h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>Infrastructure Security:</strong> Provided by Supabase (AWS-based infrastructure)</p>
                  <p><strong>Physical Security:</strong> AWS data center security controls</p>
                  <p><strong>Network Security:</strong> VPC isolation, firewall rules, DDoS protection</p>
                  <p><strong>Compliance:</strong> Supabase maintains SOC 2 Type II certification</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Cloud Service Customer Responsibilities</h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>Application Security:</strong> Implemented through RLS policies and access controls</p>
                  <p><strong>Data Classification:</strong> Sensitive data identified and protected accordingly</p>
                  <p><strong>Access Management:</strong> User roles and permissions properly configured</p>
                  <p><strong>Monitoring:</strong> Application-level logging and audit trails implemented</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Shared Responsibilities</h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>Data Encryption:</strong> TLS in transit (customer + provider), encryption at rest (provider)</p>
                  <p><strong>Backup & Recovery:</strong> Automated backups (provider), application logic (customer)</p>
                  <p><strong>Incident Response:</strong> Infrastructure incidents (provider), application incidents (customer)</p>
                  <p><strong>Compliance Auditing:</strong> Platform compliance (provider), application compliance (customer)</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Cloud-Specific Controls Implementation</h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p><strong>API Security:</strong> JWT authentication, rate limiting, input validation</p>
                  <p><strong>Edge Functions:</strong> Serverless functions with isolated execution environments</p>
                  <p><strong>Database Security:</strong> RLS policies, connection pooling, query optimization</p>
                  <p><strong>Storage Security:</strong> Bucket policies, signed URLs for file access</p>
                  <p><strong>Secrets Management:</strong> Environment variables, encrypted configuration storage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Summary</CardTitle>
          <CardDescription>Quick reference for security implementations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Key Files</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li><code>src/hooks/useISOCompliance.ts</code> - ISO compliance tracking</li>
                <li><code>src/utils/auditLogger.ts</code> - Audit logging</li>
                <li><code>src/utils/securityManager.ts</code> - Security validation</li>
                <li><code>src/utils/performanceMonitor.ts</code> - Performance tracking</li>
                <li><code>src/contexts/AuthContext.tsx</code> - Authentication</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Database Tables</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li><code>user_roles</code> - User role management</li>
                <li><code>admin_audit_log</code> - Audit trail</li>
                <li><code>user_mfa</code> - Multi-factor authentication</li>
                <li><code>integration_settings</code> - Encrypted configuration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ISOCompliance;
