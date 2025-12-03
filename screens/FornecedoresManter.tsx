import React, { useEffect, useState } from 'react';
import { 
    Alert, 
    KeyboardAvoidingView, 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View, 
    ScrollView, 
    Platform,
    ActivityIndicator 
} from 'react-native';
import { firestore as db } from '../firebase';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const COLORS = {
    BACKGROUND: '#f0f2f5', 
    DARK_CARD: '#2c3e50', 
    ACCENT_PRIMARY: '#1e88e5', 
    DARK_SUBTLE: '#34495e', 
    DANGER: '#dc3545', 
    WARNING: '#ffc107', 
    SUCCESS: '#28a745', 
    TEXT_LIGHT: '#ecf0f1',
    TEXT_DARK: '#2c3e50',
    TEXT_SUBTLE: '#95a5a6',
    WHITE: '#fff',
};

const THEME = {
    bg: COLORS.BACKGROUND,
    card: COLORS.DARK_CARD,
    input: COLORS.DARK_SUBTLE,
    text: COLORS.TEXT_LIGHT,
    text_subtle: COLORS.TEXT_SUBTLE,
    accent: COLORS.ACCENT_PRIMARY,
    icon_color: COLORS.TEXT_SUBTLE
};

const ESPECIALIDADES_COMUNS = ["Peças", "Óleo", "Pneus", "Ferramentas"];

type FornecedorManterRouteParams = {
    item?: {
        id: string;
        nome: string;
        telefone: string;
        especialidade: string;
        endereco?: string;
    };
};
type FornecedorManterRouteProp = RouteProp<{ params: FornecedorManterRouteParams }, 'params'>;

export default function FornecedoresManter() {
    const navigation = useNavigation();
    const route = useRoute<FornecedorManterRouteProp>();
    const itemParaEditar = route.params?.item;

   
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [especialidade, setEspecialidade] = useState('');
    
    
    const [cep, setCep] = useState('');
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    
    const refFornecedores = db.collection("fornecedores");

    useEffect(() => {
        if (itemParaEditar) {
            setNome(itemParaEditar.nome);
            setTelefone(itemParaEditar.telefone);
            setEspecialidade(itemParaEditar.especialidade);
           
            setRua(itemParaEditar.endereco || '');
        }
    }, [itemParaEditar]);

  
    const buscarCep = async (texto: string) => {
        const cepLimpo = texto.replace(/\D/g, '');
        setCep(cepLimpo);

        if (cepLimpo.length === 8) {
            setLoadingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    setRua(data.logradouro);
                    setBairro(data.bairro);
                    setCidade(data.localidade);
                    setUf(data.uf);
                 
                } else {
                    Alert.alert("Atenção", "CEP não encontrado.");
                }
            } catch (error) {
                Alert.alert("Erro", "Sem conexão para buscar o CEP.");
            } finally {
                setLoadingCep(false);
            }
        }
    };

    const salvar = async () => {
        if (!nome || !telefone || !especialidade) {
            Alert.alert("Campos Obrigatórios", "Preencha Nome, Telefone e Especialidade.");
            return;
        }

        setIsSaving(true);
        
       
        let enderecoCompleto = rua;
        if (numero) enderecoCompleto += `, ${numero}`;
        if (bairro) enderecoCompleto += ` - ${bairro}`;
        if (cidade) enderecoCompleto += `, ${cidade}`;
        if (uf) enderecoCompleto += ` - ${uf}`;
        if (cep) enderecoCompleto += ` (CEP: ${cep})`;

        const dadosFornecedor = {
            nome: nome.trim(),
            telefone: telefone.trim(),
            especialidade: especialidade.trim(),
            endereco: enderecoCompleto.trim(),
        };

        try {
            if (itemParaEditar) {
                await refFornecedores.doc(itemParaEditar.id).update(dadosFornecedor);
                Alert.alert("Sucesso", "Fornecedor atualizado!");
            } else {
                await refFornecedores.add(dadosFornecedor);
                Alert.alert("Sucesso", "Fornecedor adicionado!");
            }
            Limpar();
            navigation.goBack(); 
        } catch (error) {
            console.error("Erro ao salvar:", error);
            Alert.alert("Erro", "Não foi possível salvar. Verifique a conexão.");
        } finally {
            setIsSaving(false);
        }
    }

    const Limpar = () => {
        setNome('');
        setTelefone('');
        setEspecialidade('');
        setCep('');
        setRua('');
        setNumero('');
        setBairro('');
        setCidade('');
        setUf('');
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                         <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.TEXT_DARK} />
                    </TouchableOpacity>
                    <Text style={styles.tituloHeader}>
                        {itemParaEditar ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </Text>
                    <View style={{width: 40}} /> 
                </View>

                
                <View style={styles.formCard}>
                    
                    <Text style={styles.sectionTitle}>Dados Gerais</Text>

                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="store" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                        <TextInput
                            placeholder='Nome do Fornecedor'
                            placeholderTextColor={THEME.text_subtle}
                            style={styles.input}
                            value={nome}
                            onChangeText={setNome}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="phone" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                        <TextInput
                            placeholder='Telefone / WhatsApp'
                            placeholderTextColor={THEME.text_subtle}
                            style={styles.input}
                            value={telefone}
                            onChangeText={setTelefone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* SELEÇÃO RÁPIDA */}
                    <Text style={[styles.label, {marginTop: 10}]}>Especialidade</Text>
                    <View style={styles.chipsContainer}>
                        {ESPECIALIDADES_COMUNS.map((item) => {
                            const isSelected = especialidade === item;
                            return (
                                <TouchableOpacity
                                    key={item}
                                    style={[
                                        styles.chip, 
                                        isSelected && styles.chipSelected
                                    ]}
                                    onPress={() => setEspecialidade(item)}
                                >
                                    <Text style={[
                                        styles.chipText, 
                                        isSelected && styles.chipTextSelected
                                    ]}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="tools" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                        <TextInput
                            placeholder='Ou digite a especialidade...'
                            placeholderTextColor={THEME.text_subtle}
                            style={styles.input}
                            value={especialidade}
                            onChangeText={setEspecialidade}
                        />
                    </View>

                    {/* SEÇÃO LOCALIZAÇÃO COM CEP */}
                    <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Localização (Automática)</Text>

                    {/* CAMPO CEP */}
                    <View style={styles.row}>
                        <View style={[styles.inputContainer, { flex: 1 }]}>
                            <MaterialCommunityIcons name="map-search" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                            <TextInput
                                placeholder='CEP (Digite para buscar)'
                                placeholderTextColor={THEME.text_subtle}
                                style={styles.input}
                                value={cep}
                                onChangeText={buscarCep}
                                keyboardType="numeric"
                                maxLength={9}
                            />
                            {loadingCep && <ActivityIndicator size="small" color={THEME.accent} style={{marginRight: 10}}/>}
                        </View>
                    </View>

                   
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="road" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                        <TextInput
                            placeholder='Endereço (Rua, Avenida...)'
                            placeholderTextColor={THEME.text_subtle}
                            style={styles.input}
                            value={rua}
                            onChangeText={setRua}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                            <TextInput
                                placeholder='Número'
                                placeholderTextColor={THEME.text_subtle}
                                style={styles.input}
                                value={numero}
                                onChangeText={setNumero}
                            />
                        </View>
                        <View style={[styles.inputContainer, { flex: 2 }]}>
                            <TextInput
                                placeholder='Bairro'
                                placeholderTextColor={THEME.text_subtle}
                                style={styles.input}
                                value={bairro}
                                onChangeText={setBairro}
                            />
                        </View>
                    </View>
  
                    <View style={styles.row}>
                        <View style={[styles.inputContainer, { flex: 3, marginRight: 10 }]}>
                            <MaterialCommunityIcons name="city" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                            <TextInput
                                placeholder='Cidade'
                                placeholderTextColor={THEME.text_subtle}
                                style={styles.input}
                                value={cidade}
                                onChangeText={setCidade}
                            />
                        </View>
                        <View style={[styles.inputContainer, { flex: 1 }]}>
                            <TextInput
                                placeholder='UF'
                                placeholderTextColor={THEME.text_subtle}
                                style={styles.input}
                                value={uf}
                                onChangeText={setUf}
                                maxLength={2}
                                autoCapitalize='characters'
                            />
                        </View>
                    </View>
                    
                 
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={styles.btnSalvar} 
                            onPress={salvar}
                            disabled={isSaving}
                        >
                            {isSaving ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <MaterialCommunityIcons name="content-save" size={22} color="#fff" style={{marginRight: 8}}/>
                                    <Text style={styles.btnSalvarText}>Salvar Dados</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {!itemParaEditar && (
                             <TouchableOpacity onPress={Limpar} style={styles.btnLimpar}>
                                <Text style={styles.btnLimparText}>Limpar Campos</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: THEME.bg, 
    },
    scrollContainer: {
        flexGrow: 1, 
        paddingHorizontal: 24,
        paddingTop: 60, 
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    tituloHeader: { 
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.TEXT_DARK, 
    },
    
    
    formCard: {
        backgroundColor: THEME.card, 
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: THEME.text,
        textTransform: 'uppercase',
        marginBottom: 15,
        letterSpacing: 1,
        opacity: 0.8,
    },
    label: {
        fontSize: 12,
        color: THEME.text_subtle,
        marginBottom: 8,
        fontWeight: '600',
    },

   
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.input, 
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: THEME.text,
        paddingVertical: 14,
        fontSize: 16,
    },
    
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    chip: {
        backgroundColor: THEME.input,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: THEME.input,
    },
    chipSelected: {
        backgroundColor: THEME.accent,
        borderColor: THEME.accent,
    },
    chipText: {
        color: THEME.text_subtle,
        fontSize: 13,
        fontWeight: '600',
    },
    chipTextSelected: {
        color: COLORS.WHITE,
    },

    
    actionButtons: {
        marginTop: 20,
        gap: 15,
    },
    btnSalvar: {
        backgroundColor: THEME.accent,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: THEME.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
    },
    btnSalvarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnLimpar: {
        alignItems: 'center',
        padding: 10,
    },
    btnLimparText: {
        color: THEME.text_subtle,
        textDecorationLine: 'underline',
    },
});