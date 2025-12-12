# ISO Compliance Documentation

## Overview
This document provides a comprehensive overview of how ISO 27001, ISO 27002, and ISO 27017 standards are implemented in this project.

## Quick Access
View the full interactive documentation at: `/admin/iso-compliance`

## ISO 27001 - Information Security Management System (ISMS)

### A.9 Access Control
**Implementation**: Role-based access control (RBAC) with separation of concerns
- **Database Table**: `user_roles` - Stores user role assignments separately from user profiles
- **Security Function**: `has_role(user_id, role)` - Security definer function for role verification
- **Roles**: Admin, Developer, Teacher, Student with hierarchical permissions
- **Enforcement**: Row-Level Security (RLS) policies on all tables

### A.9.2 Authentication & Authorization
**Implementation**: Multi-layered authentication system
- **Primary Auth**: Supabase Auth with JWT tokens
- **MFA Support**: Multi-Factor Authentication using TOTP
- **Storage**: `user_mfa` table stores encrypted MFA secrets
- **Session Management**: Automatic token refresh with secure storage
- **Password Policy**: Complexity requirements enforced via database triggers

### A.10 Cryptography
**Implementation**: End-to-end encryption
- **Data in Transit**: HTTPS/TLS encryption for all communications
- **Data at Rest**: PostgreSQL encryption at rest via Supabase
- **Secrets Management**: `integration_settings` table with hashed sensitive values
- **Key Management**: Environment-based secret storage

### A.12.4 Logging & Monitoring
**Implementation**: Comprehensive audit trail
- **Audit Logs**: `admin_audit_log` table tracks all administrative actions
- **Captured Data**: User ID, action, table name, IP address, user agent, before/after values
- **Real-time Updates**: Live audit log streaming via Supabase subscriptions
- **Implementation**: `src/utils/auditLogger.ts`, `src/hooks/useISOCompliance.ts`
- **Retention**: Indefinite with timestamp tracking

### A.12.4.1 Security Monitoring
**Implementation**: Real-time system monitoring
- **Performance Monitoring**: Response time, memory usage, cache hit rate
- **Implementation**: `src/utils/performanceMonitor.ts`
- **Security Manager**: `src/utils/securityManager.ts` for session validation
- **ISO Compliance Hook**: `src/hooks/useISOCompliance.ts` for component-level tracking

## ISO 27002 - Security Controls Best Practices

### Organizational Controls (5.x)
- **5.1 Information Security Policies**: RLS policies and access control rules
- **5.2 Information Security Roles**: Hierarchical role system (Admin → Developer → Teacher → Student)
- **5.3 Segregation of Duties**: Separate tables for user data and roles

### People Controls (6.x)
- **6.1 Screening**: User verification through student ID and email validation
- **6.2 Terms and Conditions**: Acceptance tracked in user creation flow
- **6.3 Security Awareness**: Built-in security prompts and validation

### Physical Controls (7.x)
- **7.1-7.3 Physical Security**: Managed by cloud provider (Supabase/AWS)
- **Data Center Security**: SOC 2 Type II certified infrastructure

### Technological Controls (8.x)
- **8.1 User Endpoint Devices**: Browser-based access with session management
- **8.2 Privileged Access Rights**: Role-based access with admin privileges isolated
- **8.3 Information Access Restriction**: RLS policies enforce data isolation
- **8.4 Source Code Access**: Version controlled, limited access
- **8.5 Secure Authentication**: MFA, JWT tokens, password complexity

## ISO 27017 - Cloud Security Controls

### Cloud Service Provider Responsibilities
- **Infrastructure Security**: Supabase (AWS-based)
- **Physical Security**: AWS data center security controls
- **Network Security**: VPC isolation, firewall rules, DDoS protection
- **Compliance**: SOC 2 Type II certification

### Cloud Service Customer Responsibilities
- **Application Security**: RLS policies and access controls
- **Data Classification**: Sensitive data protection
- **Access Management**: User roles and permissions
- **Monitoring**: Application-level logging and audit trails

### Shared Responsibilities
- **Data Encryption**: TLS in transit, encryption at rest
- **Backup & Recovery**: Automated backups (provider), application logic (customer)
- **Incident Response**: Infrastructure (provider), application (customer)
- **Compliance Auditing**: Platform (provider), application (customer)

### Cloud-Specific Controls
- **API Security**: JWT authentication, rate limiting, input validation
- **Edge Functions**: Serverless with isolated execution
- **Database Security**: RLS policies, connection pooling, query optimization
- **Storage Security**: Bucket policies, signed URLs
- **Secrets Management**: Environment variables, encrypted configuration

## Key Implementation Files

### Authentication & Authorization
- `src/contexts/AuthContext.tsx` - Main authentication context
- `supabase/functions/mfa-*/` - Multi-factor authentication (Supabase Edge Functions)
- `src/hooks/useAuth.ts` - Authentication hooks
- `src/services/authService.ts` - Authentication service layer

### Security & Compliance
- `src/hooks/useISOCompliance.ts` - ISO compliance tracking hook
- `src/utils/auditLogger.ts` - Audit logging utility
- `src/utils/securityManager.ts` - Security validation and session management
- `src/utils/performanceMonitor.ts` - Performance tracking

### Database Tables
- `user_roles` - User role assignments (RBAC)
- `admin_audit_log` - Comprehensive audit trail
- `user_mfa` - Multi-factor authentication data
- `integration_settings` - Encrypted configuration storage

## Database Functions
- `has_role(user_id, role)` - Security definer function for role verification
- `get_current_user_role()` - Retrieve current user's role
- `authenticate_by_student_id(student_id, password)` - Student authentication

## Compliance Verification

### How to Verify Implementation
1. **Access Control**: Check `user_roles` table and `has_role()` function
2. **Audit Logging**: Review `admin_audit_log` table entries
3. **MFA**: Test MFA setup and verification flow
4. **RLS Policies**: Query database policy information via Developer Dashboard
5. **Performance Monitoring**: View metrics on Performance Dashboard

### Testing Checklist
- [ ] User role assignment and verification
- [ ] MFA setup and validation
- [ ] Audit log generation for admin actions
- [ ] Session validation and timeout
- [ ] RLS policy enforcement
- [ ] Password complexity validation
- [ ] Real-time monitoring metrics

## Maintenance & Updates

### Regular Reviews
- **Quarterly**: Review RLS policies and access controls
- **Bi-annually**: Audit log analysis and security assessment
- **Annually**: Full ISO compliance audit

### Documentation Updates
- Update this document when adding new security features
- Document any changes to RLS policies or access controls
- Track security-related database migrations

## References
- [ISO 27001 Official Documentation](https://www.iso.org/isoiec-27001-information-security.html)
- [ISO 27002 Official Documentation](https://www.iso.org/standard/75652.html)
- [ISO 27017 Official Documentation](https://www.iso.org/standard/43757.html)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)

## Contact
For security concerns or compliance questions, please contact the system administrator or security team.

---

**Last Updated**: 2025-11-17  
**Compliance Status**: Active Implementation  
**Next Review**: Quarterly
