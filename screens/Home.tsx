import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function Home() {
  const navigation = useNavigation();

  const logout = () => {
    auth.signOut().then(() => {
      navigation.navigate('Login');
    });
  };


  const menuOptions = [
    { id: '1', title: 'Estoque', icon: 'warehouse', screen: 'Estoque' },
    { id: '2', title: 'Manutenção', icon: 'wrench-clock', screen: 'Manutenções' },
    { id: '3', title: 'Usuários', icon: 'account-group', screen: 'Usuarios' },
    { id: '4', title: 'Fornecedores', icon: 'truck', screen: 'Fornecedores' }, 
  ];
  

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem} 
      onPress={() => navigation.navigate(item.screen)}
    >
      <MaterialCommunityIcons name={item.icon} size={36} color="#fff" style={styles.icon} />
      <Text style={styles.menuText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.card}>
        <FlatList
          data={menuOptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.menuList}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={28} color="#fff" />
          <Text style={styles.menuText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d8d8d8ff',
    paddingHorizontal: 24, 
    paddingTop: '15%', 
    paddingBottom: '5%', 
  },
  logo: {
   
    width: width * 0.4, 
    height: width * 0.4, 
    alignSelf: 'center',
    marginBottom: 20, 
  },
  card: {
    backgroundColor: '#1f1f2e',
    padding: 20, 
    borderRadius: 20, 
    flex: 1, 
  },
  menuList: {
    paddingBottom: 20, 
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  menuItem: {
  
    width: '48%', 
    backgroundColor: '#2c2c3e',
    borderRadius: 15,
  
    paddingVertical: '10%', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    marginTop: 10,
    width: '100%', 
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
  },
  icon: {
    marginBottom: 8,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});