import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  FileText, 
  CheckCircle, 
  Clock,
  Smartphone,
  ArrowLeft,
  Play,
  MessageCircle,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpPatient = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/help')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-teal-500 text-white p-2 rounded-lg">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Guia do Paciente
            </h1>
            <p className="text-muted-foreground">
              Como acessar e responder questionários da sua clínica
            </p>
          </div>
        </div>
      </div>

      {/* Início Rápido */}
      <Card className="border-teal-200 bg-teal-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <Play className="h-5 w-5" />
            Início Rápido
          </CardTitle>
          <CardDescription>
            Passos simples para começar a usar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h3 className="font-semibold">Acesse sua Conta</h3>
                <p className="text-sm text-muted-foreground">
                  Use o email e senha fornecidos pela clínica para fazer login
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="font-semibold">Veja seus Questionários</h3>
                <p className="text-sm text-muted-foreground">
                  No painel inicial, encontre os formulários disponíveis
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="font-semibold">Responda no seu Ritmo</h3>
                <p className="text-sm text-muted-foreground">
                  Você pode pausar e continuar depois de onde parou
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h3 className="font-semibold">Acompanhe o Progresso</h3>
                <p className="text-sm text-muted-foreground">
                  Veja seu progresso e questionários pendentes
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guias Detalhados */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Painel</TabsTrigger>
          <TabsTrigger value="forms">Questionários</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="support">Suporte</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Navegando pelo Painel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Página Inicial</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• <strong>Questionários Pendentes:</strong> Lista dos formulários que você precisa responder</li>
                    <li>• <strong>Em Andamento:</strong> Questionários que você começou mas ainda não finalizou</li>
                    <li>• <strong>Concluídos:</strong> Histórico dos questionários já respondidos</li>
                    <li>• <strong>Próximos Passos:</strong> Informações sobre próximas etapas do seu tratamento</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Status dos Questionários</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Pendente - Aguardando resposta</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Em Andamento - Parcialmente respondido</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Concluído - Totalmente respondido</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm">Aguardando - Timing específico</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Navegação</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Use o menu lateral para acessar diferentes seções</li>
                    <li>• Clique no seu nome no canto superior para configurações</li>
                    <li>• A página "Meus Fluxos" mostra todo seu histórico</li>
                    <li>• Use a busca para encontrar questionários específicos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Respondendo Questionários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Tipos de Perguntas</h3>
                  <div className="grid gap-3">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Texto Livre</h4>
                      <p className="text-xs text-muted-foreground">
                        Digite sua resposta no campo de texto. Seja detalhado quando necessário.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Múltipla Escolha</h4>
                      <p className="text-xs text-muted-foreground">
                        Selecione uma ou mais opções da lista apresentada.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Escalas</h4>
                      <p className="text-xs text-muted-foreground">
                        Use o controle deslizante para indicar intensidade ou frequência.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Números</h4>
                      <p className="text-xs text-muted-foreground">
                        Digite valores numéricos como peso, altura, idade, etc.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Salvamento Automático</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Suas respostas são salvas automaticamente</li>
                    <li>• Você pode fechar o navegador e voltar depois</li>
                    <li>• O progresso é mantido entre dispositivos</li>
                    <li>• Use "Salvar e Continuar Depois" se precisar pausar</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Dicas Importantes</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Leia todas as instruções antes de responder</li>
                    <li>• Seja honesto e preciso em suas respostas</li>
                    <li>• Se não souber uma resposta, deixe em branco</li>
                    <li>• Revise suas respostas antes de finalizar</li>
                    <li>• Entre em contato com a clínica se tiver dúvidas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Usando no Celular
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Acesso Móvel</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• O sistema funciona em qualquer navegador móvel</li>
                    <li>• Recomendamos Chrome, Safari ou Firefox</li>
                    <li>• Você pode adicionar um atalho na tela inicial</li>
                    <li>• Funciona offline após carregar o questionário</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Criando Atalho na Tela Inicial</h3>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">iPhone/iPad (Safari):</h4>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                      <li>• Abra o site no Safari</li>
                      <li>• Toque no botão de compartilhar (quadrado com seta)</li>
                      <li>• Selecione "Adicionar à Tela Inicial"</li>
                      <li>• Confirme o nome e toque em "Adicionar"</li>
                    </ul>
                    
                    <h4 className="font-medium text-sm">Android (Chrome):</h4>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                      <li>• Abra o site no Chrome</li>
                      <li>• Toque nos três pontos (menu)</li>
                      <li>• Selecione "Adicionar à tela inicial"</li>
                      <li>• Confirme o nome e toque em "Adicionar"</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Dicas para Uso Móvel</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Use orientação retrato para melhor experiência</li>
                    <li>• Mantenha conexão estável durante o upload</li>
                    <li>• Feche outros aplicativos para melhor performance</li>
                    <li>• Use teclado virtual otimizado para números quando necessário</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Suporte e Ajuda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Problemas Comuns</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-sm">Não consigo fazer login</h4>
                      <p className="text-xs text-muted-foreground">
                        Verifique seu email e senha. Se esqueceu a senha, entre em contato com a clínica.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-sm">Questionário não carrega</h4>
                      <p className="text-xs text-muted-foreground">
                        Atualize a página (F5) ou tente em outro navegador. Verifique sua conexão.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-sm">Perdi minhas respostas</h4>
                      <p className="text-xs text-muted-foreground">
                        As respostas são salvas automaticamente. Faça login novamente para recuperá-las.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Como Entrar em Contato</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• <strong>Clínica:</strong> Use os contatos fornecidos pela sua clínica</li>
                    <li>• <strong>WhatsApp:</strong> Se configurado, você pode receber notificações</li>
                    <li>• <strong>Email:</strong> Responda ao email de convite se tiver dúvidas</li>
                    <li>• <strong>Telefone:</strong> Ligue diretamente para a clínica</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacidade e Segurança
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Suas informações são protegidas por criptografia</li>
                    <li>• Apenas sua clínica tem acesso aos seus dados</li>
                    <li>• Você pode solicitar cópia dos seus dados a qualquer momento</li>
                    <li>• Mantenha sua senha segura e não compartilhe com outros</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpPatient;