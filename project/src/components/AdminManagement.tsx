import React, { useState } from 'react';
import { Users, Key, Network, Activity, X, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface AdminManagementProps {
  onClose: () => void;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = {
    administrator: {
      name: 'Administrator',
      description: 'Full system access and control',
      color: 'blue',
      permissions: ['All Permissions', 'System Control', 'User Management'],
      users: [
        { name: 'Anas Sadki', email: 'anassadki@gmail.com', initials: 'AS' }
      ]
    },
    moderator: {
      name: 'Moderator',
      description: 'Content moderation and user management',
      color: 'purple',
      permissions: ['Content Mod', 'User Review', 'Reports'],
      users: [
        { name: 'Ahmed', email: 'ahmed@gmail.com', initials: 'AH' }
      ]
    },
    basic: {
      name: 'Basic User',
      description: 'Standard access to features',
      color: 'gray',
      permissions: ['View Content', 'Basic Actions'],
      users: [
        { name: 'Amine', email: 'amine@gmail.com', initials: 'AM' }
      ]
    }
  };

  const renderRoleDetails = (roleKey: string) => {
    const role = roles[roleKey as keyof typeof roles];
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-${role.color}-100 flex items-center justify-center`}>
                  <Key className={`w-5 h-5 text-${role.color}-600`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{role.name}</h2>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 bg-${role.color}-100 text-${role.color}-700 rounded-full text-sm font-medium`}
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Users with this role</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
              <div className="space-y-2">
                {role.users.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-${role.color}-100 flex items-center justify-center text-${role.color}-600 font-semibold`}>
                        {user.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUserManagement = () => (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
        <Users className="w-7 h-7 text-blue-600" />
        User Management
      </h3>
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-semibold mb-4 text-lg text-gray-700">Active Users</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">AS</div>
                <div>
                  <span className="font-medium text-gray-800">Anas Sadki</span>
                  <p className="text-sm text-gray-500">anassadki@gmail.com</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">AH</div>
                <div>
                  <span className="font-medium text-gray-800">Ahmed</span>
                  <p className="text-sm text-gray-500">ahmed@gmail.com</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">AM</div>
                <div>
                  <span className="font-medium text-gray-800">Amine</span>
                  <p className="text-sm text-gray-500">amine@gmail.com</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccessRights = () => (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
        <Key className="w-7 h-7 text-blue-600" />
        Access Rights Management
      </h3>
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-semibold mb-4 text-lg text-gray-700">Role Types</h4>
          <div className="space-y-3">
            {Object.entries(roles).map(([key, role]) => (
              <button
                key={key}
                onClick={() => setSelectedRole(key)}
                className="w-full p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-${role.color}-100 flex items-center justify-center`}>
                      <Key className={`w-5 h-5 text-${role.color}-600`} />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800">{role.name}</h5>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderKnowledgeGraph = () => (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
        <Network className="w-7 h-7 text-blue-600" />
        Knowledge Graph Management
      </h3>
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-semibold mb-4 text-lg text-gray-700">Graph Statistics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Total Nodes</p>
              <p className="text-2xl font-bold text-blue-600">1,234</p>
              <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Total Relationships</p>
              <p className="text-2xl font-bold text-purple-600">5,678</p>
              <p className="text-xs text-green-600 mt-1">↑ 8% from last month</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Last Updated</p>
              <p className="text-2xl font-bold text-green-600">2024-03-20</p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-100">
              <p className="text-sm text-gray-600 mb-1">Active Categories</p>
              <p className="text-2xl font-bold text-orange-600">15</p>
              <p className="text-xs text-green-600 mt-1">↑ 3 new this week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemMonitoring = () => (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
        <Activity className="w-7 h-7 text-blue-600" />
        System Monitoring
      </h3>
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-semibold mb-4 text-lg text-gray-700">System Status</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div>
                  <span className="font-medium text-gray-800">Server Status</span>
                  <p className="text-sm text-gray-500">Main Production Server</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div>
                  <span className="font-medium text-gray-800">Database Status</span>
                  <p className="text-sm text-gray-500">Primary Database Cluster</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div>
                  <span className="font-medium text-gray-800">API Status</span>
                  <p className="text-sm text-gray-500">REST API Services</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Administrator Management</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setActiveSection('users')}
              className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                activeSection === 'users' 
                  ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
                  : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
              }`}
            >
              <Users className="w-6 h-6 text-blue-600" />
              <span className="font-medium">User Management</span>
            </button>

            <button
              onClick={() => setActiveSection('access')}
              className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                activeSection === 'access' 
                  ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
                  : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
              }`}
            >
              <Key className="w-6 h-6 text-blue-600" />
              <span className="font-medium">Access Rights Management</span>
            </button>

            <button
              onClick={() => setActiveSection('graph')}
              className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                activeSection === 'graph' 
                  ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
                  : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
              }`}
            >
              <Network className="w-6 h-6 text-blue-600" />
              <span className="font-medium">Knowledge Graph Management</span>
            </button>

            <button
              onClick={() => setActiveSection('monitoring')}
              className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                activeSection === 'monitoring' 
                  ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
                  : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
              }`}
            >
              <Activity className="w-6 h-6 text-blue-600" />
              <span className="font-medium">System Monitoring</span>
            </button>
          </div>

          <div className="mt-6">
            {activeSection === 'users' && renderUserManagement()}
            {activeSection === 'access' && renderAccessRights()}
            {activeSection === 'graph' && renderKnowledgeGraph()}
            {activeSection === 'monitoring' && renderSystemMonitoring()}
          </div>
        </div>
      </div>
      {selectedRole && renderRoleDetails(selectedRole)}
    </div>
  );
};

export default AdminManagement; 