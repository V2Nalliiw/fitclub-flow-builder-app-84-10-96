
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from '@/components/ui/file-upload';
import { Palette, Save, Eye, Layout, Type } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Customization = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [brandLogo, setBrandLogo] = useState<File[]>([]);
  const [brandIcon, setBrandIcon] = useState<File[]>([]);
  
  const [customization, setCustomization] = useState({
    brandName: 'FitClub',
    primaryColor: '#5D8701',
    secondaryColor: '#E5F3D3',
    accentColor: '#8FBC47',
    fontFamily: 'Inter',
    borderRadius: 'medium',
    customCSS: '',
    showBranding: true,
    customFooter: '',
    loginPageTitle: 'Bem-vindo ao Sistema',
    loginPageSubtitle: 'Faça login para acessar sua conta',
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCustomization = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Personalização salva",
        description: "As configurações de aparência foram atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a personalização.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const colorPresets = [
    { name: 'Verde Padrão', primary: '#5D8701', secondary: '#E5F3D3', accent: '#8FBC47' },
    { name: 'Azul Profissional', primary: '#2563EB', secondary: '#DBEAFE', accent: '#60A5FA' },
    { name: 'Roxo Moderno', primary: '#7C3AED', secondary: '#EDE9FE', accent: '#A78BFA' },
    { name: 'Rosa Suave', primary: '#EC4899', secondary: '#FCE7F3', accent: '#F472B6' },
  ];

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setCustomization(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Personalização</h1>
        <p className="text-muted-foreground">Customize a aparência do sistema</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Identidade Visual */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Identidade Visual</CardTitle>
            </div>
            <CardDescription>
              Configure a marca e cores do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="brand-name">Nome da Marca</Label>
              <Input
                id="brand-name"
                value={customization.brandName}
                onChange={(e) => handleInputChange('brandName', e.target.value)}
              />
            </div>

            <div>
              <Label>Logo Principal</Label>
              <FileUpload
                onFilesChange={setBrandLogo}
                maxFiles={1}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] }}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Ícone/Favicon</Label>
              <FileUpload
                onFilesChange={setBrandIcon}
                maxFiles={1}
                accept={{ 'image/*': ['.png', '.ico', '.svg'] }}
                className="mt-2"
              />
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Paleta de Cores</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Escolha um preset ou customize manualmente
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {colorPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyColorPreset(preset)}
                    className="justify-start gap-2"
                  >
                    <div className="flex gap-1">
                      <div 
                        className="w-3 h-3 rounded-full border" 
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full border" 
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    {preset.name}
                  </Button>
                ))}
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={customization.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customization.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      placeholder="#5D8701"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={customization.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customization.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      placeholder="#E5F3D3"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent-color">Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={customization.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customization.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      placeholder="#8FBC47"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Layout */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              <CardTitle>Layout e Tipografia</CardTitle>
            </div>
            <CardDescription>
              Ajuste o layout e fontes do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="font-family">Fonte</Label>
              <select
                id="font-family"
                className="w-full p-2 border rounded-md"
                value={customization.fontFamily}
                onChange={(e) => handleInputChange('fontFamily', e.target.value)}
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Poppins">Poppins</option>
              </select>
            </div>

            <div>
              <Label htmlFor="border-radius">Arredondamento dos Cantos</Label>
              <select
                id="border-radius"
                className="w-full p-2 border rounded-md"
                value={customization.borderRadius}
                onChange={(e) => handleInputChange('borderRadius', e.target.value)}
              >
                <option value="none">Nenhum</option>
                <option value="small">Pequeno</option>
                <option value="medium">Médio</option>
                <option value="large">Grande</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Mostrar Marca FitClub</Label>
                <p className="text-sm text-muted-foreground">Exibir marca original no rodapé</p>
              </div>
              <Switch
                checked={customization.showBranding}
                onCheckedChange={(value) => handleInputChange('showBranding', value)}
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="login-title">Título da Página de Login</Label>
              <Input
                id="login-title"
                value={customization.loginPageTitle}
                onChange={(e) => handleInputChange('loginPageTitle', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="login-subtitle">Subtítulo da Página de Login</Label>
              <Input
                id="login-subtitle"
                value={customization.loginPageSubtitle}
                onChange={(e) => handleInputChange('loginPageSubtitle', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="custom-footer">Rodapé Personalizado</Label>
              <Input
                id="custom-footer"
                value={customization.customFooter}
                onChange={(e) => handleInputChange('customFooter', e.target.value)}
                placeholder="© 2024 Sua Empresa. Todos os direitos reservados."
              />
            </div>
          </CardContent>
        </Card>

        {/* CSS Personalizado */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              <CardTitle>CSS Personalizado</CardTitle>
            </div>
            <CardDescription>
              Adicione CSS personalizado para customizações avançadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="custom-css">CSS Personalizado</Label>
              <textarea
                id="custom-css"
                value={customization.customCSS}
                onChange={(e) => handleInputChange('customCSS', e.target.value)}
                placeholder={`/* Exemplo de CSS personalizado */
.sidebar {
  background: linear-gradient(45deg, #5D8701, #8FBC47);
}

.card {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}`}
                rows={10}
                className="w-full p-3 border rounded-md font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 justify-end">
        <Button variant="outline" size="lg">
          <Eye className="h-4 w-4 mr-2" />
          Visualizar
        </Button>
        <Button onClick={handleSaveCustomization} disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Personalização'}
        </Button>
      </div>
    </div>
  );
};
