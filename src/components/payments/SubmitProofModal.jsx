import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from '@/components/common/FormField';
import { Badge } from "@/components/ui/badge";

export default function SubmitProofModal({ open, onOpenChange, payment }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    payment_date: payment?.payment_date || new Date().toISOString().split('T')[0],
    amount: payment?.due_amount || '',
    payment_method: 'orange_money',
    transaction_reference: '',
    notes: ''
  });
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const submitProofMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.PaymentProof.create({
        ...data,
        submission_date: new Date().toISOString(),
        submitted_by: user?.email,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-proofs'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Justificatif soumis pour validation');
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast.error('Erreur lors de la soumission');
    }
  });

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    setReceiptFiles([...receiptFiles, ...files]);
    
    // Upload files
    setUploading(true);
    const urls = [];
    for (const file of files) {
      try {
        const response = await base44.integrations.Core.UploadFile({ file });
        urls.push(response.file_url);
      } catch (error) {
        toast.error(`Erreur upload: ${file.name}`);
      }
    }
    setUploadedUrls([...uploadedUrls, ...urls]);
    setUploading(false);
  };

  const removeFile = (index) => {
    setReceiptFiles(receiptFiles.filter((_, i) => i !== index));
    setUploadedUrls(uploadedUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (uploadedUrls.length === 0) {
      toast.error('Veuillez ajouter au moins un justificatif');
      return;
    }

    submitProofMutation.mutate({
      payment_id: payment?.id,
      vehicle_id: payment?.vehicle_id,
      driver_id: payment?.driver_id,
      ...formData,
      amount: parseFloat(formData.amount),
      receipt_urls: uploadedUrls
    });
  };

  const resetForm = () => {
    setFormData({
      payment_date: new Date().toISOString().split('T')[0],
      amount: '',
      payment_method: 'orange_money',
      transaction_reference: '',
      notes: ''
    });
    setReceiptFiles([]);
    setUploadedUrls([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Soumettre un justificatif de paiement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Date de paiement"
              name="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              required
            />
            <FormField
              label="Montant (FCFA)"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Mode de paiement"
              name="payment_method"
              type="select"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              options={[
                { value: 'orange_money', label: 'Orange Money' },
                { value: 'wave', label: 'Wave' },
                { value: 'free_money', label: 'Free Money' },
                { value: 'cash', label: 'Espèces' },
                { value: 'bank_transfer', label: 'Virement bancaire' }
              ]}
            />
            <FormField
              label="Référence transaction"
              name="transaction_reference"
              value={formData.transaction_reference}
              onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
              placeholder="Ex: OM12345678"
            />
          </div>

          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
          />

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Justificatifs (reçu, capture d'écran) *
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-amber-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-upload"
                disabled={uploading}
              />
              <label
                htmlFor="receipt-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                )}
                <p className="text-sm text-slate-600">
                  {uploading ? 'Upload en cours...' : 'Cliquer pour ajouter des fichiers'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Images ou PDF
                </p>
              </label>
            </div>

            {/* Uploaded Files */}
            {receiptFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {receiptFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-slate-700">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitProofMutation.isPending || uploading || uploadedUrls.length === 0}
            >
              {submitProofMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Soumission...
                </>
              ) : (
                'Soumettre'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}