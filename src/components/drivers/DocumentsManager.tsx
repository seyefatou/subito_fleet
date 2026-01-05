// @ts-nocheck
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Upload, Calendar, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FormField from '@/components/common/FormField';
import { cn } from "@/lib/utils";

export default function DocumentsManager({ driver }) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newDoc, setNewDoc] = useState({ type: '', url: '', expiry_date: '' });
  const [uploading, setUploading] = useState(false);

  const updateDriverMutation = useMutation({
    mutationFn: (data) => base44.entities.Driver.update(driver.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Documents mis à jour');
      setIsAdding(false);
      setNewDoc({ type: '', url: '', expiry_date: '' });
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      setNewDoc({ ...newDoc, url: response.file_url });
      toast.success('Fichier téléchargé');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const addDocument = () => {
    const documents = driver.documents || [];
    documents.push(newDoc);
    updateDriverMutation.mutate({ documents });
  };

  const removeDocument = (index) => {
    const documents = [...(driver.documents || [])];
    documents.splice(index, 1);
    updateDriverMutation.mutate({ documents });
  };

  const getDocumentStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { label: 'Expiré', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
    } else if (daysUntilExpiry <= 7) {
      return { label: `${daysUntilExpiry}j restants`, color: 'bg-orange-100 text-orange-700', icon: AlertTriangle };
    } else if (daysUntilExpiry <= 30) {
      return { label: `${daysUntilExpiry}j restants`, color: 'bg-amber-100 text-amber-700', icon: Calendar };
    } else {
      return { label: 'Valide', color: 'bg-green-100 text-green-700', icon: CheckCircle };
    }
  };

  const licenseStatus = getDocumentStatus(driver.license_expiry);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Documents
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? 'Annuler' : 'Ajouter'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* License */}
          <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-900">Permis de conduire</p>
                <p className="text-xs text-slate-500">N° {driver.license_number}</p>
              </div>
              {licenseStatus && (
                <Badge className={licenseStatus.color}>
                  <licenseStatus.icon className="w-3 h-3 mr-1" />
                  {licenseStatus.label}
                </Badge>
              )}
            </div>
            {driver.license_expiry && (
              <p className="text-xs text-slate-600">
                Expire le: {format(new Date(driver.license_expiry), 'dd MMMM yyyy', { locale: fr })}
              </p>
            )}
          </div>

          {/* Other Documents */}
          {driver.documents && driver.documents.map((doc, idx) => {
            const status = getDocumentStatus(doc.expiry_date);
            return (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{doc.type}</p>
                    {doc.expiry_date && (
                      <p className="text-xs text-slate-600">
                        Expire: {format(new Date(doc.expiry_date), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {status && (
                      <Badge className={status.color}>
                        <status.icon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDocument(idx)}
                      className="text-red-600 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Voir le document →
                  </a>
                )}
              </div>
            );
          })}

          {/* Add Document Form */}
          {isAdding && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
              <FormField
                label="Type de document"
                name="type"
                type="select"
                value={newDoc.type}
                onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                options={[
                  { value: '', label: 'Sélectionner...' },
                  { value: 'CNI', label: 'Carte d\'identité' },
                  { value: 'Passeport', label: 'Passeport' },
                  { value: 'Attestation', label: 'Attestation' },
                  { value: 'Contrat', label: 'Contrat' },
                  { value: 'Autre', label: 'Autre' }
                ]}
              />

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Fichier
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="text-sm"
                />
                {uploading && <p className="text-xs text-blue-600 mt-1">Téléchargement...</p>}
              </div>

              <FormField
                label="Date d'expiration"
                name="expiry_date"
                type="date"
                value={newDoc.expiry_date}
                onChange={(e) => setNewDoc({ ...newDoc, expiry_date: e.target.value })}
              />

              <Button
                onClick={addDocument}
                disabled={!newDoc.type || !newDoc.url || updateDriverMutation.isPending}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Enregistrer document
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}