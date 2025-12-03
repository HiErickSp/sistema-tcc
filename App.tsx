import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importação das Telas
import Login from './screens/Login';
import Home from './screens/Home';
import Registro from './screens/Registro';
import Menu from './screens/Menu';
import ProdutoListar from './screens/ProdutoListar';
import Usuarios from './screens/Usuarios';

// Novas Telas
import ProdutoManter from './screens/ProdutoManter'; 
import Estoque from './screens/Estoque';
import ManutencaoListar from './screens/ManutencaoListar';
import ManutencaoManter from './screens/ManutencaoManter'; 
import FornecedoresListar from './screens/FornecedoresListar';
import FornecedoresManter from './screens/FornecedoresManter';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        
        {/* Telas de Acesso */}
        <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
        <Stack.Screen name='Registro' component={Registro} options={{ headerShown: false }} />
        <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} />
        
        {/* Menu Principal */}
        <Stack.Screen name='Menu' component={Menu} options={{ headerShown: false }} />
        
        {/* Telas Antigas / Outras */}
        <Stack.Screen name='ProdutoListar' component={ProdutoListar} options={{ headerShown: false }} />
        <Stack.Screen name='Usuarios' component={Usuarios} options={{ headerShown: false }} />
        
        {/* Módulo: Estoque */}
        <Stack.Screen 
          name='Estoque' 
          component={Estoque} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name='Cadastrar Produto' 
          component={ProdutoManter} 
          options={{ headerShown: false }} 
        />

        {/* Módulo: Manutenção */}
        <Stack.Screen 
          name='Manutenções' 
          component={ManutencaoListar} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name='ManutencaoManter' 
          component={ManutencaoManter} 
          options={{ headerShown: false }} 
        />
        
        {/* Módulo: Fornecedores */}
        <Stack.Screen 
          name='Fornecedores' 
          component={FornecedoresListar} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name='FornecedoresManter' 
          component={FornecedoresManter} 
          options={{ headerShown: false }} 
        />

      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});