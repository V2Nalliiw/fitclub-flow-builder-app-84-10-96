
import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface UnderDevelopmentProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
}

export const UnderDevelopment = ({ 
  title, 
  description = "Esta funcionalidade está sendo desenvolvida e estará disponível em breve.",
  showBackButton = true 
}: UnderDevelopmentProps) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Construction className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{description}</p>
          {showBackButton && (
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
