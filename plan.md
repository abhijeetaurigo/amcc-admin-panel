# AMCC Admin Panel Implementation Plan

Complete implementation guide for building the AMCC Admin Panel with backend API integration, UI components, and user workflows.

---

## 📋 Project Overview

The AMCC Admin Panel is a web-based dashboard that allows administrators to manage tenants, configure app settings, and monitor system usage across all AMCC-connected mobile applications.

### **Technology Stack Recommendation**
- **Frontend**: React.js with TypeScript
- **Styling**: Material-UI or Tailwind CSS
- **State Management**: Redux Toolkit or Zustand
- **HTTP Client**: Axios
- **Routing**: React Router
- **Authentication**: JWT token storage (localStorage/sessionStorage)

---

## 🎨 UI/UX Design Requirements

### **1. Layout Structure**
```
┌─────────────────────────────────────────────┐
│ Header: AMCC Admin Panel | Logout | Profile │
├─────────────────────────────────────────────┤
│ Sidebar Navigation                          │
│ ├── Dashboard                               │
│ ├── Tenant Management                       │
│ ├── App Settings                            │
│ ├── User Management                         │
│ └── System Logs                             │
│                                             │
│           Main Content Area                 │
│                                             │
└─────────────────────────────────────────────┘
```

### **2. Color Scheme**
- **Primary**: Aurigo Blue (#1976d2)
- **Secondary**: Dark Gray (#424242)
- **Success**: Green (#4caf50)
- **Warning**: Orange (#ff9800)
- **Error**: Red (#f44336)
- **Background**: Light Gray (#f5f5f5)

### **3. Responsive Design**
- Mobile-first approach
- Breakpoints: 768px (tablet), 1024px (desktop)
- Collapsible sidebar on mobile
- Responsive data tables with horizontal scroll

---

## 🔐 Authentication System

### **Login Page Design**
```jsx
// LoginPage Component Structure
<div className="login-container">
  <div className="login-card">
    <div className="logo-section">
      <img src="aurigo-logo.png" alt="Aurigo" />
      <h1>AMCC Admin Panel</h1>
    </div>
    <form onSubmit={handleLogin}>
      <TextField
        label="Email"
        type="email"
        required
        value={email}
        onChange={setEmail}
      />
      <TextField
        label="Password"
        type="password"
        required
        value={password}
        onChange={setPassword}
      />
      <Button type="submit" variant="contained" fullWidth>
        Sign In
      </Button>
    </form>
    {error && <Alert severity="error">{error}</Alert>}
  </div>
</div>
```

### **Authentication Flow Implementation**

**API Endpoint**: `POST /v1/admin/auth`

**Request**:
```json
{
  "email": "abhijeet.singh@aurigo.com",
  "password": "Aurigo@123"
}
```

**Response**:
```json
{
  "admin_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2026-03-26T15:54:19.000Z",
  "admin": {
    "email": "abhijeet.singh@aurigo.com",
    "name": "Abhijeet Singh",
    "role": "super_admin",
    "last_login_at": "2026-03-26T11:54:19.171Z"
  }
}
```

**Token Management**:
- Store JWT token in localStorage
- Auto-logout on token expiration (4 hours)
- Axios interceptor for automatic token injection
- Refresh token mechanism (optional enhancement)

---

## 📊 Dashboard Pages

### **1. Main Dashboard**

**Purpose**: Overview of system health and key metrics

**Components**:
- **Metrics Cards**: Total Tenants, Active Users, Active Sessions
- **Recent Activity Timeline**: Latest tenant registrations, admin actions
- **System Health Indicators**: API uptime, response times
- **Quick Actions**: Add New Tenant, View Recent Logs

**API Endpoints Used**:
- `GET /v1/admin/tenants` - Get tenant count and list
- `GET /v1/admin/system/metrics` - System health metrics (future endpoint)

### **2. Tenant Management Page**

**Purpose**: View and manage all tenants in the system

**Layout**:
```jsx
// Tenant Management Page Structure
<div className="tenant-management">
  <div className="page-header">
    <h2>Tenant Management</h2>
    <Button variant="contained" onClick={handleAddTenant}>
      Add New Tenant
    </Button>
  </div>

  <div className="filters-section">
    <TextField label="Search by domain" />
    <Select label="Status">
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </Select>
    <Select label="Subscription Tier">
      <option value="all">All Tiers</option>
      <option value="standard">Standard</option>
      <option value="premium">Premium</option>
    </Select>
  </div>

  <DataGrid
    columns={tenantColumns}
    rows={tenants}
    onRowClick={handleTenantSelect}
  />
</div>
```

**Data Table Columns**:
- Domain Name
- Build URL
- Created Date
- Last Seen
- Total Users
- Active Sessions
- Subscription Tier
- Status
- Actions (View, Edit, Disable)

**API Endpoint**: `GET /v1/admin/tenants`

**Response Structure**:
```json
{
  "tenants": [
    {
      "tenant_uuid": "ten_01KMMW3RYVRFN81JCWFSZNT23S",
      "domain_name": "mwmobiledevmcon.aurigo.net",
      "build_url": "https://mwmobiledevmcon.aurigo.net/",
      "created_at": "2026-03-26T10:47:45.883Z",
      "last_seen_at": "2026-03-26T11:09:11.720Z",
      "is_active": true,
      "total_users": 25,
      "total_active_sessions": 8,
      "subscription_info": {
        "tier": "standard",
        "features": ["auth", "remote_config"],
        "max_users": 100
      }
    }
  ],
  "total_count": 1
}
```

### **3. Tenant Details Page**

**Purpose**: Detailed view and management of individual tenant

**URL**: `/tenants/{tenantUuid}`

**Tabs Structure**:
1. **Overview** - Tenant metadata and statistics
2. **App Settings** - Configuration management
3. **Users** - User list and management (future)
4. **Sessions** - Active sessions monitoring (future)
5. **Audit Log** - Change history

**App Settings Tab Implementation**:
```jsx
// App Settings Tab Component
<div className="app-settings-tab">
  <div className="tab-header">
    <h3>App Settings Configuration</h3>
    <Button variant="contained" onClick={handleAddSetting}>
      Add New Setting
    </Button>
  </div>

  <div className="settings-grid">
    {settings.map(setting => (
      <Card key={setting.setting_key} className="setting-card">
        <CardHeader
          title={setting.setting_key}
          action={
            <IconButton onClick={() => editSetting(setting)}>
              <EditIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {setting.description}
          </Typography>
          <Chip
            label={setting.setting_type}
            size="small"
            color="primary"
          />
          <Typography variant="h6">
            Value: {String(setting.setting_value)}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={() => editSetting(setting)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => deleteSetting(setting)}>
            Delete
          </Button>
        </CardActions>
      </Card>
    ))}
  </div>
</div>
```

---

## ⚙️ App Settings Management

### **Settings CRUD Operations**

**1. View All Settings**
- **API**: `GET /v1/admin/tenants/{tenantUuid}/app-settings`
- **Display**: Grid/list view with search and filter
- **Features**: Bulk operations, export/import

**2. View Specific Setting**
- **API**: `GET /v1/admin/tenants/{tenantUuid}/app-settings/{settingKey}`
- **Display**: Modal or drawer with full details

**3. Create New Setting**
- **API**: `POST /v1/admin/tenants/{tenantUuid}/app-settings/{settingKey}`
- **Form Fields**:
  - Setting Key (input)
  - Setting Value (input with type validation)
  - Setting Type (dropdown: boolean, string, number, json)
  - Description (textarea)
  - Platform (dropdown: all, ios, android)
  - Min App Version (input)
  - Max App Version (input)

**4. Update Setting**
- **API**: `PUT /v1/admin/tenants/{tenantUuid}/app-settings/{settingKey}`
- **Form**: Same as create with pre-filled values

### **Setting Form Component**
```jsx
// SettingForm Component
const SettingForm = ({ setting, tenantUuid, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    setting_value: setting?.setting_value || '',
    setting_type: setting?.setting_type || 'string',
    description: setting?.description || '',
    platform: setting?.platform || 'all',
    min_app_version: setting?.min_app_version || '',
    max_app_version: setting?.max_app_version || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = setting ?
      `PUT /v1/admin/tenants/${tenantUuid}/app-settings/${setting.setting_key}` :
      `POST /v1/admin/tenants/${tenantUuid}/app-settings/${formData.setting_key}`;

    // API call implementation
    await apiClient.request(endpoint, formData);
    onSave();
  };

  return (
    <Dialog open onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {setting ? 'Edit Setting' : 'Create New Setting'}
        </DialogTitle>
        <DialogContent>
          {!setting && (
            <TextField
              label="Setting Key"
              required
              fullWidth
              value={formData.setting_key}
              onChange={(e) => setFormData({...formData, setting_key: e.target.value})}
            />
          )}
          <TextField
            label="Setting Value"
            required
            fullWidth
            value={formData.setting_value}
            onChange={(e) => setFormData({...formData, setting_value: e.target.value})}
          />
          <Select
            label="Setting Type"
            value={formData.setting_type}
            onChange={(e) => setFormData({...formData, setting_type: e.target.value})}
          >
            <MenuItem value="string">String</MenuItem>
            <MenuItem value="boolean">Boolean</MenuItem>
            <MenuItem value="number">Number</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
          </Select>
          {/* Additional form fields */}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained">
            {setting ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
```

---

## 🛡️ Security Implementation

### **1. Authentication Guards**
```jsx
// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  const tokenExpiry = localStorage.getItem('token_expiry');

  if (!token || new Date() > new Date(tokenExpiry)) {
    // Clear expired token
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token_expiry');
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

### **2. API Client Configuration**
```jsx
// API Client Setup
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://7g4v6419uk.execute-api.us-east-1.amazonaws.com',
  timeout: 10000
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token_expiry');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### **3. Role-Based Access Control**
```jsx
// Role-based component rendering
const AdminAction = ({ requiredRole = 'admin', children }) => {
  const adminData = JSON.parse(localStorage.getItem('admin_data'));
  const hasAccess = adminData?.role === 'super_admin' ||
                   adminData?.role === requiredRole;

  return hasAccess ? children : null;
};

// Usage
<AdminAction requiredRole="super_admin">
  <Button onClick={deleteAllTenants}>Delete All Tenants</Button>
</AdminAction>
```

---

## 📱 Responsive Design Implementation

### **Mobile Sidebar Navigation**
```jsx
// Responsive Sidebar Component
const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setMobileOpen(true)}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        <SidebarContent />
      </Drawer>
    </>
  );
};
```

---

## 🔗 API Integration Details

### **Complete API Endpoints List**

| Method | Endpoint | Purpose | Page/Component |
|--------|----------|---------|----------------|
| POST | `/v1/admin/auth` | Admin login | Login Page |
| GET | `/v1/admin/tenants` | List all tenants | Dashboard, Tenant Management |
| GET | `/v1/admin/tenants/{uuid}/app-settings` | Get tenant settings | Tenant Details (App Settings Tab) |
| GET | `/v1/admin/tenants/{uuid}/app-settings/{key}` | Get specific setting | Setting Detail Modal |
| POST | `/v1/admin/tenants/{uuid}/app-settings/{key}` | Create setting | Add Setting Form |
| PUT | `/v1/admin/tenants/{uuid}/app-settings/{key}` | Update setting | Edit Setting Form |

### **Error Handling Strategy**
```jsx
// Global Error Handler
const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleApiError = (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          setError('Session expired. Please login again.');
          // Redirect to login
          break;
        case 403:
          setError('Access denied. Insufficient permissions.');
          break;
        case 404:
          setError('Resource not found.');
          break;
        case 500:
          setError('Server error. Please try again later.');
          break;
        default:
          setError(data.error || 'An unexpected error occurred.');
      }
    } else {
      setError('Network error. Please check your connection.');
    }
  };

  return { error, handleApiError, clearError: () => setError(null) };
};
```

---

## 📋 Implementation Phases

### **Phase 1: Core Authentication & Navigation (Week 1)**
- [ ] Setup React project with TypeScript
- [ ] Implement login page with API integration
- [ ] Create protected route system
- [ ] Build main layout with sidebar navigation
- [ ] Setup API client with interceptors

### **Phase 2: Dashboard & Tenant Management (Week 2)**
- [ ] Build main dashboard with metrics cards
- [ ] Implement tenant listing page with data table
- [ ] Add search and filtering functionality
- [ ] Create responsive design for mobile devices
- [ ] Add loading states and error handling

### **Phase 3: Tenant Details & App Settings (Week 3)**
- [ ] Build tenant details page with tabs
- [ ] Implement app settings CRUD operations
- [ ] Create setting forms with validation
- [ ] Add bulk operations for settings
- [ ] Implement audit trail display

### **Phase 4: Advanced Features & Polish (Week 4)**
- [ ] Add user management section (future API)
- [ ] Implement system logs viewing
- [ ] Add export/import functionality for settings
- [ ] Create admin profile management
- [ ] Performance optimization and testing

---

## 🧪 Testing Strategy

### **Unit Tests**
- Component rendering tests
- Form validation tests
- API client function tests
- Authentication logic tests

### **Integration Tests**
- Complete user flows (login → dashboard → tenant management)
- API integration tests with mock servers
- Error handling scenarios

### **E2E Tests**
- Full admin workflow testing
- Cross-browser compatibility
- Mobile responsiveness testing

---

## 🚀 Deployment Considerations

### **Build Configuration**
```json
// package.json scripts
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:staging": "REACT_APP_API_URL=https://staging-api.amcc.aurigo.com react-scripts build",
    "build:production": "REACT_APP_API_URL=https://api.amcc.aurigo.com react-scripts build"
  }
}
```

### **Environment Variables**
```env
# .env.development
REACT_APP_API_URL=https://7g4v6419uk.execute-api.us-east-1.amazonaws.com
REACT_APP_APP_NAME=AMCC Admin Panel
REACT_APP_VERSION=1.0.0

# .env.production
REACT_APP_API_URL=https://api.amcc.aurigo.com
REACT_APP_APP_NAME=AMCC Admin Panel
REACT_APP_VERSION=1.0.0
```

### **Hosting Options**
- **AWS S3 + CloudFront**: Static hosting with CDN
- **Vercel**: Easy deployment with automatic HTTPS
- **Netlify**: CI/CD integration with GitHub

---

## 📊 Performance Optimization

### **Code Splitting**
```jsx
// Lazy loading for routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TenantManagement = lazy(() => import('./pages/TenantManagement'));
const TenantDetails = lazy(() => import('./pages/TenantDetails'));

// Route configuration
<Route
  path="/dashboard"
  element={
    <Suspense fallback={<CircularProgress />}>
      <Dashboard />
    </Suspense>
  }
/>
```

### **Data Caching**
- React Query for API data caching
- Local storage for user preferences
- Service worker for offline functionality (optional)

---

## 🔐 Default Admin Credentials

**Email**: `abhijeet.singh@aurigo.com`
**Password**: `Aurigo@123`
**Role**: `super_admin`

> **Security Note**: Change default credentials after first login in production.

---

## 📈 Future Enhancement Ideas

1. **Real-time Notifications**: WebSocket integration for live updates
2. **Advanced Analytics**: Charts and graphs for usage metrics
3. **Multi-tenant Admin**: Support for tenant-specific admin users
4. **API Rate Limiting Dashboard**: Monitor and configure API limits
5. **Automated Backups**: Schedule and monitor system backups
6. **Audit Log Export**: Download audit trails in various formats
7. **Dark Mode**: Theme switching capability
8. **Mobile App**: React Native admin app for mobile management

---

This implementation plan provides a complete roadmap for building a professional, secure, and scalable AMCC Admin Panel that integrates seamlessly with the existing backend API infrastructure.