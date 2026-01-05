// @ts-nocheck
"use client";

import React from 'react';
import { User, Mail, Phone, Shield } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function UserProfile() {
  // Mock user data
  const user = {
    full_name: 'Utilisateur',
    email: 'user@example.com',
    phone: '+221 77 000 00 00',
    role: 'admin'
  };

  return (
    <div>
      <PageHeader
        title="Mon Profil"
        subtitle="Gérez vos informations personnelles"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={null} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl font-bold">
                  {user.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-slate-900">{user.full_name}</h2>
              <p className="text-sm text-slate-500">{user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Nom complet</p>
                  <p className="font-medium">{user.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Téléphone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <Shield className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Rôle</p>
                  <p className="font-medium">{user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
                </div>
              </div>
            </div>

            <Button className="mt-6">
              Modifier le profil
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
