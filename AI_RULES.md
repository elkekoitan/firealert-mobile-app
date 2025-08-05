## Supabase Integration Rules

### Database Schema Standards
- **Table Naming**: Use snake_case for table names (e.g., `fire_reports`, `user_profiles`)
- **Column Naming**: Use snake_case for column names
- **Primary Keys**: Use UUID with `gen_random_uuid()` as default
- **Timestamps**: Always include `created_at` and `updated_at` columns
- **Foreign Keys**: Use `REFERENCES` with `ON DELETE CASCADE` for user relationships

### Row Level Security (RLS) - MANDATORY
- **Enable RLS on ALL tables**: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY`
- **Policies Required**: SELECT, INSERT, UPDATE, DELETE policies for each table
- **User Isolation**: Users can only access their own data unless explicitly required
- **Policy Pattern**: `auth.uid() = user_id` for user-specific data
- **Public Access**: Only add public read policies when specifically requested

### Authentication Flow
- **Supabase Auth**: Use Supabase Auth for all user authentication
- **User Profiles**: Auto-create profile on signup via database trigger
- **Session Management**: Use `onAuthStateChange` for session monitoring
- **Token Storage**: Store tokens in expo-secure-store, never AsyncStorage
- **Auto-redirect**: Redirect authenticated users to main app, others to login

### Edge Functions
- **Location**: Place in `supabase/functions/` directory
- **Naming**: Use kebab-case for function names (e.g., `process-fire-report`)
- **CORS**: Always include CORS headers in responses
- **Error Handling**: Return proper HTTP status codes and error messages
- **Logging**: Implement comprehensive logging for debugging

### Real-time Subscriptions
- **Channel Naming**: Use pattern: `fire-reports:user-${userId}`
- **Cleanup**: Always unsubscribe in useEffect cleanup
- **Error Handling**: Handle connection errors gracefully
- **Reconnection**: Implement automatic reconnection logic

### Storage Rules
- **Bucket Structure**: 
  - `fire-reports` - User uploaded fire photos
  - `user-avatars` - Profile pictures
  - `system-images` - App assets
- **File Naming**: Use UUIDs with original extension
- **Access Control**: Private by default, public only when needed
- **Image Optimization**: Resize images before upload using expo-image-manipulator

### API Integration Patterns
```typescript
// Preferred pattern for Supabase calls
const { data, error } = await supabase
  .from('fire_reports')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

if (error) {
  console.error('Error fetching reports:', error)
  throw new Error(error.message)
}

return data
```

### Migration Standards
- **File Naming**: Use timestamp + description (e.g., `20241201_create_fire_reports.sql`)
- **Rollback Scripts**: Always include rollback statements
- **Testing**: Test migrations on staging before production
- **Documentation**: Document schema changes in commit messages

### Performance Optimization
- **Indexes**: Create indexes on frequently queried columns
- **Query Limits**: Always use `.limit()` for list queries
- **Pagination**: Use cursor-based pagination for large datasets
- **Caching**: Implement query caching for static data
- **Connection Pooling**: Use Supabase's built-in connection pooling

### Security Checklist
- [ ] RLS enabled on all tables
- [ ] Policies restrict access appropriately
- [ ] API keys stored in environment variables
- [ ] Input validation on all user inputs
- [ ] Rate limiting implemented
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention in stored content
- [ ] File upload restrictions (type, size)

### Monitoring & Alerts
- **Database Performance**: Monitor query performance via Supabase dashboard
- **Error Tracking**: Log all database errors to Sentry
- **Usage Analytics**: Track API usage patterns
- **Storage Monitoring**: Monitor storage usage and costs
- **Real-time Connections**: Monitor WebSocket connection health

### Backup Strategy
- **Automated Backups**: Enable daily automated backups
- **Manual Backups**: Before major schema changes
- **Retention Policy**: 30 days for automated backups
- **Testing**: Regular restore testing on staging environment
- **Documentation**: Document backup and restore procedures

### Development Workflow
1. **Local Development**: Use local Supabase CLI
2. **Staging**: Deploy to staging environment first
3. **Testing**: Run full test suite including integration tests
4. **Production**: Deploy with zero-downtime strategy
5. **Rollback**: Always have rollback plan ready

### Common Patterns
```typescript
// User-specific query pattern
const getUserReports = async (userId: string) => {
  return await supabase
    .from('fire_reports')
    .select(`
      *,
      user:profiles!user_id(name, avatar_url)
    `)
    .eq('user_id', userId)
}

// Real-time subscription pattern
const subscribeToReports = (callback: (report: FireReport) => void) => {
  return supabase
    .channel('fire-reports')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'fire_reports' },
      callback
    )
    .subscribe()
}