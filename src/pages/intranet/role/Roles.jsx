import React from 'react';
import Layout from '../../../components/intranet/user/Layout';
import RoleList from '../../../components/intranet/role/RoleList';

const Roles = ({ user, onLogout }) => {
  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="bg-slate-800 rounded-lg shadow-2xl overflow-hidden w-full border border-slate-600">
        <div style={{padding:16}}>
          <RoleList />
        </div>
      </div>
    </Layout>
  );
};

export default Roles;
