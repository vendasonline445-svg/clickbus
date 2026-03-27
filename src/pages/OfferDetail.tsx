import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Download, Copy, Code, Eye,
  Globe, FileText, ImagePlus, X, Camera, Expand,
} from 'lucide-react';
import { useSites } from '@/contexts/SiteContext';
import { ClonedSite } from '@/types/site';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const OfferDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getSite, updateSite } = useSites();
  const { toast } = useToast();
  const [site, setSite] = useState<ClonedSite | null>(null);
  const [isFetchingHtml, setIsFetchingHtml] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getSite(id);
      if (found) setSite(found);
      else navigate('/');
    }
  }, [id, getSite, navigate]);

  const save = () => {
    if (!site) return;
    updateSite(site.id, site);
    toast({ title: 'Salvo!', description: 'Alterações salvas.' });
  };

  const handleBack = () => { save(); navigate('/'); };

  const exportHtml = () => {
    if (!site?.html) {
      toast({ title: 'Sem HTML', description: 'Esta oferta ainda não tem HTML clonado.', variant: 'destructive' });
      return;
    }
    const blob = new Blob([site.html + (site.customCss ? `\n<style>${site.customCss}</style>` : '')], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.slug || site.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
    updateSite(site.id, { status: 'exported' });
    setSite(prev => prev ? { ...prev, status: 'exported' } : prev);
    toast({ title: 'Exportado!', description: 'HTML baixado com sucesso.' });
  };

  const copyHtml = () => {
    if (!site?.html) return;
    navigator.clipboard.writeText(site.html);
    toast({ title: 'HTML copiado!' });
  };

  const isMaosProject =
    site?.platform === 'Mãos Que Acolhem' ||
    site?.name.includes('Mãos Que Acolhem') ||
    site?.sourceUrl?.includes('/funil/maos-que-acolhem') ||
    site?.sourceUrl?.includes('ongmaosqueacolhem.com');

  const fetchHtmlFromSource = async () => {
    if (isMaosProject) {
      const internalHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Mãos Que Acolhem</title><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden}iframe{width:100%;height:100%;border:0}</style></head><body><iframe src="/funil/maos-que-acolhem"></iframe></body></html>';
      const patch: Partial<ClonedSite> = {
        html: internalHtml,
        sourceUrl: '/funil/maos-que-acolhem',
        status: 'cloned',
        clonedAt: site?.clonedAt || new Date().toISOString(),
      };

      updateSite(site.id, patch);
      setSite((prev) => (prev ? { ...prev, ...patch } : prev));
      toast({ title: 'Preview interno restaurado!', description: 'O projeto Mãos agora aponta apenas para as rotas internas.' });
      return;
    }

    if (!site?.sourceUrl || isFetchingHtml) return;

    try {
      setIsFetchingHtml(true);
      const { data, error } = await supabase.functions.invoke('fetch-site', {
        body: { url: site.sourceUrl },
      });

      if (error || !data?.html) {
        toast({
          title: 'Não foi possível carregar',
          description: error?.message || 'A URL bloqueou o acesso ou retornou vazia.',
          variant: 'destructive',
        });
        return;
      }

      const nowIso = new Date().toISOString();
      const patch: Partial<ClonedSite> = {
        html: data.html,
        sourceUrl: data.finalUrl || site.sourceUrl,
        status: 'cloned',
        clonedAt: site.clonedAt || nowIso,
      };

      updateSite(site.id, patch);
      setSite((prev) => (prev ? { ...prev, ...patch } : prev));

      toast({ title: 'HTML carregado!', description: 'Preview pronto para visualizar.' });
    } catch {
      toast({
        title: 'Erro ao buscar HTML',
        description: 'Tente novamente em alguns segundos.',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingHtml(false);
    }
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendente', className: 'bg-yellow-500/15 text-yellow-600' },
    cloned: { label: 'Clonada', className: 'bg-blue-500/15 text-blue-600' },
    editing: { label: 'Editando', className: 'bg-purple-500/15 text-purple-600' },
    exported: { label: 'Exportada', className: 'bg-green-500/15 text-green-600' },
  };

  const buildPreviewHtml = () => {

    const rawHtml = site?.html || '';
    if (!rawHtml) return '';

    const safeBase = site?.sourceUrl || '/';
    const normalizedHtml = /<meta[^>]+charset=/i.test(rawHtml)
      ? rawHtml
      : rawHtml.replace(/<head([^>]*)>/i, '<head$1><meta charset="utf-8" />');

    const htmlWithHead = /<head[^>]*>/i.test(normalizedHtml)
      ? normalizedHtml
      : `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body>${normalizedHtml}</body></html>`;

    const withBase = /<base\s/i.test(htmlWithHead)
      ? htmlWithHead
      : htmlWithHead.replace(/<head([^>]*)>/i, `<head$1><base href="${safeBase}" />`);

    if (site?.customCss) {
      return withBase.replace(/<\/head>/i, `<style>${site.customCss}</style></head>`);
    }

    return withBase;
  };

  const previewHtml = useMemo(() => (isMaosProject ? '' : buildPreviewHtml()), [isMaosProject, site?.html, site?.customCss, site?.sourceUrl]);
  const previewSrc = isMaosProject ? '/funil/maos-que-acolhem' : undefined;
  const currentTab = searchParams.get('tab') || (site?.html || isMaosProject ? 'preview' : 'info');

  if (!site) return null;

  const openFullscreenPreview = () => {
    if (isMaosProject) {
      window.open('/funil/maos-que-acolhem', '_blank', 'noopener,noreferrer');
      return;
    }

    if (!previewHtml) {
      toast({
        title: 'Sem preview ainda',
        description: 'Clone o site primeiro para abrir em tela cheia.',
        variant: 'destructive',
      });
      return;
    }

    const blob = new Blob([previewHtml], { type: 'text/html' });
    const previewUrl = URL.createObjectURL(blob);
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-semibold text-sm truncate max-w-[200px]">{site.name}</h1>
            <Badge variant="secondary" className={statusConfig[site.status]?.className}>
              {statusConfig[site.status]?.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={fetchHtmlFromSource} disabled={isFetchingHtml}>
              <Eye size={14} className="mr-1" /> {isFetchingHtml ? 'Clonando...' : 'Atualizar Preview'}
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={save}>
              <Save size={14} className="mr-1" /> Salvar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Tabs value={currentTab} onValueChange={(value) => setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set('tab', value);
          return next;
        })}>
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-secondary p-1 rounded-xl mb-6">
            <TabsTrigger value="info" className="text-xs flex-1 min-w-[70px]"><FileText size={14} className="mr-1" /> Info</TabsTrigger>
            <TabsTrigger value="preview" className="text-xs flex-1 min-w-[70px]"><Eye size={14} className="mr-1" /> Preview</TabsTrigger>
            <TabsTrigger value="html" className="text-xs flex-1 min-w-[70px]"><Code size={14} className="mr-1" /> HTML</TabsTrigger>
            <TabsTrigger value="export" className="text-xs flex-1 min-w-[70px]"><Download size={14} className="mr-1" /> Exportar</TabsTrigger>
          </TabsList>

          {/* INFO */}
          <TabsContent value="info">
            <div className="rounded-xl border bg-card p-5 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nome / Apelido</Label>
                  <Input value={site.name} onChange={e => setSite({ ...site, name: e.target.value })} />
                </div>
                <div>
                  <Label>URL Original</Label>
                  <Input value={site.sourceUrl} onChange={e => setSite({ ...site, sourceUrl: e.target.value })} />
                </div>
                <div>
                  <Label>Nicho</Label>
                  <Input value={site.niche || ''} onChange={e => setSite({ ...site, niche: e.target.value })} placeholder="Ex: Emagrecimento" />
                </div>
                <div>
                  <Label>Plataforma</Label>
                  <Input value={site.platform || ''} onChange={e => setSite({ ...site, platform: e.target.value })} placeholder="Ex: Hotmart" />
                </div>
                <div>
                  <Label>Data que viu a oferta</Label>
                  <Input type="date" value={site.seenAt ? site.seenAt.split('T')[0] : ''} onChange={e => setSite({ ...site, seenAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
                </div>
                <div>
                  <Label>Data da clonagem</Label>
                  <Input type="date" value={site.clonedAt ? site.clonedAt.split('T')[0] : ''} onChange={e => setSite({ ...site, clonedAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={site.status} onValueChange={(v: any) => setSite({ ...site, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="cloned">Clonada</SelectItem>
                    <SelectItem value="editing">Editando</SelectItem>
                    <SelectItem value="exported">Exportada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Estava escalando?</Label>
                <Switch checked={site.wasScaling || false} onCheckedChange={v => setSite({ ...site, wasScaling: v })} />
              </div>

              <div>
                <Label>Tags (separadas por vírgula)</Label>
                <Input
                  value={site.tags?.join(', ') || ''}
                  onChange={e => setSite({ ...site, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  placeholder="vsl, urgência, escassez"
                />
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={site.notes || ''}
                  onChange={e => setSite({ ...site, notes: e.target.value })}
                  placeholder="Anotações sobre a oferta, estratégias observadas..."
                  className="min-h-[120px]"
                />
              </div>

              {/* Screenshots */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Camera size={14} /> Screenshots do Funil Original
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Salve prints da oferta original para referência futura, caso o site caia ou mude.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {(site.screenshots || []).map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border bg-muted aspect-video">
                      <img src={img} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover object-top" />
                      <button
                        onClick={() => {
                          const updated = [...(site.screenshots || [])];
                          updated.splice(idx, 1);
                          setSite({ ...site, screenshots: updated });
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                      <button
                        onClick={() => {
                          const w = window.open('');
                          w?.document.write(`<img src="${img}" style="max-width:100%;height:auto;" />`);
                        }}
                        className="absolute bottom-1 left-1 p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Add button */}
                  <label className="rounded-lg border-2 border-dashed border-muted-foreground/30 aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <ImagePlus size={24} className="text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Adicionar</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const base64 = ev.target?.result as string;
                            setSite(prev => prev ? {
                              ...prev,
                              screenshots: [...(prev.screenshots || []), base64],
                            } : prev);
                          };
                          reader.readAsDataURL(file);
                        });
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              <Button onClick={save} className="w-full gradient-primary text-primary-foreground">
                <Save size={16} className="mr-2" /> Salvar Alterações
              </Button>
            </div>
          </TabsContent>

          {/* PREVIEW */}
          <TabsContent value="preview">
            <div className="rounded-xl border bg-card overflow-hidden">
              {site.html || isMaosProject ? (
                <>
                  <div className="bg-muted px-4 py-2 flex items-center gap-2 border-b">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono flex-1 text-center truncate">{previewSrc || site.sourceUrl}</span>
                    <Button size="sm" variant="outline" onClick={openFullscreenPreview}>
                      <Expand size={14} className="mr-1" /> Tela cheia
                    </Button>
                  </div>
                  <iframe
                    src={previewSrc}
                    srcDoc={previewSrc ? undefined : previewHtml}
                    className="w-full h-[calc(100vh-16rem)] min-h-[720px] bg-white"
                    title="Preview"
                    sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                  />
                </>
              ) : (
                <div className="py-20 text-center text-muted-foreground">
                  <Globe size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Sem preview ainda</p>
                  <p className="text-sm mt-1 mb-4">Clique abaixo para gerar o preview desta página.</p>
                  <Button onClick={fetchHtmlFromSource} disabled={isFetchingHtml}>
                    <Eye size={14} className="mr-1" /> {isFetchingHtml ? 'Gerando preview...' : 'Gerar Preview'}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* HTML */}
          <TabsContent value="html">
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Cole aqui o HTML da oferta clonada. Você pode pedir a clonagem diretamente no chat do Lovable.
              </p>
              <textarea
                value={site.html}
                onChange={e => setSite({ ...site, html: e.target.value })}
                onKeyDown={e => e.stopPropagation()}
                className="w-full font-mono text-xs min-h-[500px] rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                placeholder="Cole o HTML aqui..."
              />
              <div>
                <Label className="text-xs">CSS Customizado (opcional)</Label>
                <textarea
                  value={site.customCss || ''}
                  onChange={e => setSite({ ...site, customCss: e.target.value })}
                  className="w-full font-mono text-xs min-h-[100px] rounded-md border border-input bg-background px-3 py-2 resize-y mt-1"
                  placeholder="Estilos adicionais..."
                />
              </div>
            </div>
          </TabsContent>

          {/* EXPORTAR */}
          <TabsContent value="export">
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Exportar Oferta</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Baixe o HTML para usar em outro projeto com domínio próprio.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Button onClick={exportHtml} variant="outline" className="h-20 flex-col gap-1" disabled={!site.html}>
                  <Download size={20} />
                  <span className="text-xs">Baixar HTML</span>
                </Button>
                <Button onClick={copyHtml} variant="outline" className="h-20 flex-col gap-1" disabled={!site.html}>
                  <Copy size={20} />
                  <span className="text-xs">Copiar HTML</span>
                </Button>
              </div>
              {!site.html && (
                <p className="text-xs text-muted-foreground text-center">Nenhum HTML disponível para exportar.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OfferDetail;
