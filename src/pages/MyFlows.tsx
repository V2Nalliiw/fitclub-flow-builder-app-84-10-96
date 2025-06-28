
import { FlowsList } from '@/components/flows/FlowsList';
import { useAuth } from '@/contexts/AuthContext';

const MyFlows = () => {
  const { user } = useAuth();

  // This component now serves as both the clinic flows overview page
  // and the patient's "Dicas e Formulários" page
  return <FlowsList />;
};

export default MyFlows;
