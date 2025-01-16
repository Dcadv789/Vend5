import React, { useState, useEffect } from 'react';
import { Save, FileDown, Building2 } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Notification } from '../components/Notification';

interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency';
  required: boolean;
  enabled: boolean;
  group: 'faturamento' | 'custos_fixos' | 'custos_variaveis';
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica'
  },
  header: {
    backgroundColor: '#1E40AF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  headerContent: {
    flex: 1
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 12
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
    gap: 5
  },
  headerColumn: {
    flex: 1
  },
  headerLabel: {
    color: '#93C5FD',
    fontSize: 10,
    marginBottom: 2
  },
  headerValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  headerDateLabel: {
    color: '#93C5FD',
    fontSize: 8,
    marginBottom: 2
  },
  headerDateValue: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#93C5FD',
    opacity: 0.3,
    marginVertical: 8,
    marginHorizontal: 0
  },
  headerLogo: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    marginLeft: 20
  },
  content: {
    padding: 30
  },
  section: {
    marginBottom: 5,
    backgroundColor: '#F8FAFC',
    padding: 3,
    borderRadius: 4
  },
  sectionTitle: {
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8
  },
  row: {
    marginBottom: 8
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 2
  },
  label: {
    fontSize: 10,
    color: '#64748B'
  },
  value: {
    fontSize: 10,
    color: '#1E293B',
    fontWeight: 'bold'
  },
  analysis: {
    padding: 12,
    marginBottom: 15,
    borderRadius: 4
  },
  analysisGreen: {
    backgroundColor: '#DCFCE7',
  },
  analysisYellow: {
    backgroundColor: '#FEF9C3',
  },
  analysisRed: {
    backgroundColor: '#FEE2E2',
  },
  analysisTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold'
  },
  analysisTitleGreen: {
    color: '#166534',
  },
  analysisTitleYellow: {
    color: '#854D0E',
  },
  analysisTitleRed: {
    color: '#991B1B',
  },
  analysisText: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 1.4
  },
  analysisTextGreen: {
    color: '#166534',
  },
  analysisTextYellow: {
    color: '#854D0E',
  },
  analysisTextRed: {
    color: '#991B1B',
  },
  recommendedValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4
  },
  recommendedValueGreen: {
    color: '#166534',
  },
  recommendedValueYellow: {
    color: '#854D0E',
  },
  recommendedValueRed: {
    color: '#991B1B',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  }
});

const ProLaborePDF = ({ fields, groupedFields, companyName, cnpj, lastCalculation }: { 
  fields: TemplateField[], 
  groupedFields: Record<string, TemplateField[]>,
  companyName: string,
  cnpj: string,
  lastCalculation: any
}) => {
  const getDiagnosisInfo = (current: number, recommended: number, maximum: number) => {
    if (current <= recommended) {
      return {
        text: 'O valor atual do pró-labore está adequado à realidade financeira da empresa',
        color: 'green'
      };
    }
    
    if (current <= maximum) {
      return {
        text: `O valor atual do Pró-labore está adequado à realidade financeira da empresa, mas próximo do limite, o que é arriscado. Garanta uma reserva financeira mínima de ${(lastCalculation?.monthlyFixedCosts * 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        color: 'yellow'
      };
    }
    
    return {
      text: 'Considere ajustar o valor do pró-labore para garantir a saúde financeira da empresa',
      color: 'red'
    };
  };

  const diagnosis = getDiagnosisInfo(
    lastCalculation?.currentProLabore || 0,
    (lastCalculation?.maximumRecommended || 0) * 0.7,
    lastCalculation?.maximumRecommended || 0
  );

  const getAnalysisStyle = (color: string) => {
    return {
      analysis: [styles.analysis, color === 'green' ? styles.analysisGreen : color === 'yellow' ? styles.analysisYellow : styles.analysisRed],
      title: [styles.analysisTitle, color === 'green' ? styles.analysisTitleGreen : color === 'yellow' ? styles.analysisTitleYellow : styles.analysisTitleRed],
      text: [styles.analysisText, color === 'green' ? styles.analysisTextGreen : color === 'yellow' ? styles.analysisTextYellow : styles.analysisTextRed],
      value: [styles.recommendedValue, color === 'green' ? styles.recommendedValueGreen : color === 'yellow' ? styles.recommendedValueYellow : styles.recommendedValueRed]
    };
  };

  const analysisStyle = getAnalysisStyle(diagnosis.color);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Relatório de Pró-labore</Text>
            
            <View style={styles.headerRow}>
              <View style={styles.headerColumn}>
                <Text style={styles.headerLabel}>Empresa</Text>
                <Text style={styles.headerValue}>{companyName || 'Nome da Empresa'}</Text>
              </View>
              <View style={styles.headerColumn}>
                <Text style={styles.headerLabel}>CNPJ</Text>
                <Text style={styles.headerValue}>{cnpj || '00.000.000/0001-00'}</Text>
              </View>
            </View>

            <View style={styles.headerDivider} />

            <View style={styles.headerRow}>
              <View style={styles.headerColumn}>
                <Text style={styles.headerDateLabel}>Data</Text>
                <Text style={styles.headerDateValue}>
                  {new Date().toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <View style={styles.headerColumn}>
                <Text style={styles.headerDateLabel}>Horário</Text>
                <Text style={styles.headerDateValue}>
                  {new Date().toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  })}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headerLogo} />
        </View>

        <View style={styles.content}>
          <View style={analysisStyle.analysis}>
            <Text style={analysisStyle.title}>Análise e Recomendações</Text>
            <Text style={analysisStyle.text}>{diagnosis.text}</Text>
            <Text style={analysisStyle.value}>
              Pró-labore Recomendado: {lastCalculation ? 
                (lastCalculation.maximumRecommended * 0.7).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }) : 
                'R$ 0,00'
              }
            </Text>
            <Text style={analysisStyle.value}>
              Pró-labore Máximo: {lastCalculation ? 
                lastCalculation.maximumRecommended.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }) : 
                'R$ 0,00'
              }
            </Text>
          </View>

          {Object.entries(groupedFields).map(([group, groupFields]) => (
            groupFields[0].enabled && (
              <View key={group} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {group === 'faturamento' ? 'Faturamento' :
                   group === 'custos_fixos' ? 'Custos Fixos' :
                   'Custos Variáveis'}
                </Text>
                <View style={styles.row}>
                  {groupFields.map((field) => (
                    <View key={field.id} style={styles.rowItem}>
                      <Text style={styles.label}>{field.label}:</Text>
                      <Text style={styles.value}>
                        {lastCalculation?.[group === 'faturamento' ? 'revenue' : 
                                        group === 'custos_fixos' ? 'fixedCosts' : 
                                        'variableCosts']?.[field.id] ?
                          (group === 'custos_variaveis' ? 
                            `${lastCalculation.variableCosts[field.id].toFixed(2)}%` :
                            lastCalculation[group === 'faturamento' ? 'revenue' : 'fixedCosts'][field.id].toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })
                          ) :
                          field.type === 'currency' ? 'R$ 0,00' :
                          field.type === 'number' ? '0,00%' :
                          field.type === 'date' ? new Date().toLocaleDateString('pt-BR') :
                          'Exemplo'
                        }
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          ))}
        </View>

        <Text style={styles.footer}>
          Copyright ® 2025 DC ADVISORS - Todos os direitos reservados
        </Text>
      </Page>
    </Document>
  );
};

function ProLaboreTemplate() {
  const [fields, setFields] = useState<TemplateField[]>([
    { id: 'services', label: 'Receita com Serviços', type: 'currency', required: true, enabled: true, group: 'faturamento' },
    { id: 'products', label: 'Receita com Produtos', type: 'currency', required: true, enabled: true, group: 'faturamento' },
    { id: 'others', label: 'Outras Receitas', type: 'currency', required: true, enabled: true, group: 'faturamento' },
    { id: 'monthly', label: 'Custos Mensais', type: 'currency', required: true, enabled: true, group: 'custos_fixos' },
    { id: 'proLabore', label: 'Pró-labore Atual', type: 'currency', required: true, enabled: true, group: 'custos_fixos' },
    { id: 'sales', label: 'Custo da Mercadoria (%)', type: 'number', required: true, enabled: true, group: 'custos_variaveis' },
    { id: 'taxes', label: 'Impostos (%)', type: 'number', required: true, enabled: true, group: 'custos_variaveis' },
    { id: 'cardFees', label: 'Taxas de Cartão (%)', type: 'number', required: true, enabled: true, group: 'custos_variaveis' },
    { id: 'returns', label: 'Devoluções (%)', type: 'number', required: true, enabled: true, group: 'custos_variaveis' },
    { id: 'commission', label: 'Comissões (%)', type: 'number', required: true, enabled: true, group: 'custos_variaveis' },
    { id: 'others', label: 'Outros Custos (%)', type: 'number', required: true, enabled: true, group: 'custos_variaveis' }
  ]);
  const [showNotification, setShowNotification] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [lastCalculation, setLastCalculation] = useState<any>(null);

  useEffect(() => {
    const savedCompanyName = localStorage.getItem('companyName');
    const savedCnpj = localStorage.getItem('cnpj');
    const savedCalculation = localStorage.getItem('lastProLaboreCalculation');
    
    if (savedCompanyName) setCompanyName(savedCompanyName);
    if (savedCnpj) setCnpj(savedCnpj);
    if (savedCalculation) setLastCalculation(JSON.parse(savedCalculation));
  }, []);

  const handleToggleGroup = (group: string) => {
    setFields(fields.map(field => 
      field.group === group ? { ...field, enabled: !field.enabled } : field
    ));
  };

  const handleSaveTemplate = () => {
    setShowNotification(true);
  };

  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.group]) {
      acc[field.group] = [];
    }
    acc[field.group].push(field);
    return acc;
  }, {} as Record<string, TemplateField[]>);

  const getGroupTitle = (group: string) => {
    switch (group) {
      case 'faturamento':
        return 'Faturamento';
      case 'custos_fixos':
        return 'Custos Fixos';
      case 'custos_variaveis':
        return 'Custos Variáveis';
      default:
        return group;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {showNotification && (
        <Notification
          message="Template salvo com sucesso!"
          onClose={() => setShowNotification(false)}
        />
      )}

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Template de Pró-labore
        </h1>
        <p className="text-blue-100">
          Configure os grupos de informações que serão exibidos no relatório de pró-labore
        </p>
      </div>

      <div className="space-y-8">
        {lastCalculation && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Último Pró-Labore Calculado</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Empresa:</span>
                  <span className="font-medium text-gray-900">{companyName || 'Não informado'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">CNPJ:</span>
                  <span className="font-medium text-gray-900">{cnpj || 'Não informado'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Grupos de Informações
            </h3>
            <div className="space-y-4">
              {Object.entries(groupedFields).map(([group, groupFields]) => (
                <div key={group} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📊</span>
                    <div>
                      <p className="font-medium text-gray-900">{getGroupTitle(group)}</p>
                      <p className="text-sm text-gray-500">
                        {groupFields.length} campos disponíveis
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={groupFields[0].enabled}
                      onChange={() => handleToggleGroup(group)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={handleSaveTemplate}
                className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save size={20} className="mr-2" />
                Salvar Template
              </button>

              <PDFDownloadLink
                document={
                  <ProLaborePDF 
                    fields={fields} 
                    groupedFields={groupedFields} 
                    companyName={companyName} 
                    cnpj={cnpj}
                    lastCalculation={lastCalculation}
                  />
                }
                fileName="relatorio-pro-labore.pdf"
                className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {({ loading }) => (
                  <>
                    <FileDown size={20} className="mr-2" />
                    {loading ? 'Gerando PDF...' : 'Exportar PDF'}
                  </>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProLaboreTemplate;