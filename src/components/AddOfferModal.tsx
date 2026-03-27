import { useState } from 'react';
import { useSites } from '@/contexts/SiteContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AddOfferModal = ({ open, onClose }: Props) => {
  const { addSite } = useSites();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('');
  const [wasScaling, setWasScaling] = useState(false);
  const [platform, setPlatform] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!url.trim()) {
      toast({ title: 'URL obrigatória', variant: 'destructive' });
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    addSite(finalUrl, {
      name: name.trim() || undefined,
      niche: niche.trim() || undefined,
      wasScaling,
      platform: platform.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      notes: notes.trim() || undefined,
      status: 'pending',
      seenAt: new Date().toISOString(),
    });

    toast({ title: 'Oferta cadastrada!', description: 'Agora você pode pedir a clonagem aqui no chat.' });
    setUrl(''); setName(''); setNiche(''); setWasScaling(false); setPlatform(''); setTagsInput(''); setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Oferta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>URL da oferta *</Label>
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://concorrente.com/oferta" />
          </div>
          <div>
            <Label>Nome / Apelido</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Oferta curso X do fulano" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nicho</Label>
              <Input value={niche} onChange={e => setNiche(e.target.value)} placeholder="Ex: Emagrecimento" />
            </div>
            <div>
              <Label>Plataforma</Label>
              <Input value={platform} onChange={e => setPlatform(e.target.value)} placeholder="Ex: Hotmart, Kiwify" />
            </div>
          </div>
          <div>
            <Label>Tags (separadas por vírgula)</Label>
            <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="vsl, urgência, escassez" />
          </div>
          <div className="flex items-center justify-between">
            <Label>Estava escalando?</Label>
            <Switch checked={wasScaling} onCheckedChange={setWasScaling} />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações sobre a oferta..." className="min-h-[80px]" />
          </div>
          <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSubmit}>
            <Plus size={16} className="mr-2" /> Cadastrar Oferta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddOfferModal;
