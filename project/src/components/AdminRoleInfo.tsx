import React from 'react';
import { Shield, Users, Key, Network, Activity } from 'lucide-react';

const AdminRoleInfo: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Administrator</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        The administrator is responsible for the technical and functional management of the platform. 
        Their use cases include more advanced actions, focused on system configuration and supervision.
      </p>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-start gap-4">
            <Users className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">User Management</h3>
              <p className="text-gray-600">
                The administrator can create, modify, or delete user accounts. They can also view the list of active users 
                and manage their personal or professional information.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-start gap-4">
            <Key className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Access Rights Management</h3>
              <p className="text-gray-600">
                Access rights can be defined for each user. The administrator assigns roles (e.g., basic user, contributor, 
                moderator) and configures permissions based on needs and data sensitivity.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-start gap-4">
            <Network className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Knowledge Graph Management</h3>
              <p className="text-gray-600">
                The administrator is responsible for integrating new data into the knowledge graph. This includes processing 
                source files, updating existing entities and relationships, and ensuring the semantic consistency of the graph.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-start gap-4">
            <Activity className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">System Monitoring</h3>
              <p className="text-gray-600">
                To ensure optimal operation, the administrator accesses activity logs (logs) tracking system operations: 
                connections, errors, critical actions, etc. This monitoring allows for detecting anomalies and tracking 
                platform performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoleInfo; 