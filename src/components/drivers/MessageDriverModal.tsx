// @ts-nocheck
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Send, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from '@/components/common/FormField';
import { Badge } from "@/components/ui/badge";

export default function MessageDriverModal({ open, onOpenChange, driver }) {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    channel: 'email'
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('sendDriverMessage', {
        driverId: driver.id,
        ...data
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Message envoyé avec succès');
      onOpenChange(false);
      setFormData({ subject: '', message: '', channel: 'email' });
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'envoi');
    }
  });

  const handleSend = () => {
    if (!formData.subject || !formData.message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    sendMessageMutation.mutate(formData);
  };

  if (!driver) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" />
            Envoyer un message à {driver.first_name} {driver.last_name}
          </DialogTitle>
          <DialogDescription>
            Communication directe avec le chauffeur
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contact Info */}
          <div className="flex gap-2">
            {driver.email && (
              <Badge className="bg-blue-100 text-blue-700">
                <Mail className="w-3 h-3 mr-1" />
                {driver.email}
              </Badge>
            )}
            {driver.phone && (
              <Badge className="bg-green-100 text-green-700">
                <MessageCircle className="w-3 h-3 mr-1" />
                {driver.phone}
              </Badge>
            )}
          </div>

          {/* Channel Selection */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Canal d'envoi
            </label>
            <div className="flex gap-2">
              <Button
                variant={formData.channel === 'email' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, channel: 'email' })}
                disabled={!driver.email}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                variant={formData.channel === 'whatsapp' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, channel: 'whatsapp' })}
                disabled={!driver.phone}
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant={formData.channel === 'both' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, channel: 'both' })}
                disabled={!driver.email || !driver.phone}
                className="flex-1"
              >
                Les deux
              </Button>
            </div>
          </div>

          <FormField
            label="Sujet"
            name="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Ex: Rappel paiement, Information importante..."
          />

          <FormField
            label="Message"
            name="message"
            type="textarea"
            rows={8}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Rédigez votre message ici..."
          />

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 Le message sera envoyé avec une signature automatique de Jolof Lease
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sendMessageMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            disabled={sendMessageMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {sendMessageMutation.isPending ? (
              'Envoi...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}