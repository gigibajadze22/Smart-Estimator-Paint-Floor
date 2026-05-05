import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Keyboard, Switch, StatusBar } from 'react-native';
import Constants from 'expo-constants';

// რეკლამის ცვლადები
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

const isExpoGo = Constants.appOwnership === 'expo';

// რეკლამის დინამიური იმპორტი
if (!isExpoGo) {
  try {
    const MobileAds = require('react-native-google-mobile-ads');
    BannerAd = MobileAds.BannerAd;
    BannerAdSize = MobileAds.BannerAdSize;
    TestIds = MobileAds.TestIds;
  } catch (e) {
    console.log("Ads module not found");
  }
}

// შენი Ad Unit ID
const adUnitId = 'ca-app-pub-3563416976653646/5564522759';

interface CalculationResult {
  area: string;
  material: string | number;
  unit: string;
  areaUnit: string;
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<'paint' | 'floor' | 'wallpaper'>('paint');
  const [isImperial, setIsImperial] = useState(false);
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculate = () => {
    Keyboard.dismiss();
    const w = parseFloat(width);
    const l = parseFloat(length);
    const h = parseFloat(height);

    if (!w || (activeTab === 'floor' ? !l : !h)) return;

    if (activeTab === 'paint') {
      const totalArea = w * h;
      const coverage = isImperial ? 350 : 10;
      setResult({ 
        area: totalArea.toFixed(2), 
        material: (totalArea / coverage).toFixed(1), 
        unit: isImperial ? 'Gallons' : 'Liters',
        areaUnit: isImperial ? 'sq ft' : 'm²'
      });
    } 
    else if (activeTab === 'floor') {
      const totalArea = w * l;
      setResult({ 
        area: totalArea.toFixed(2), 
        material: (totalArea * 1.1).toFixed(2), 
        unit: isImperial ? 'sq ft' : 'm²',
        areaUnit: isImperial ? 'sq ft' : 'm²'
      });
    }
    else if (activeTab === 'wallpaper') {
      const perimeterArea = w * h;
      const rollArea = isImperial ? 56 : 5.3;
      setResult({ 
        area: perimeterArea.toFixed(2), 
        material: Math.ceil(perimeterArea / rollArea), 
        unit: 'Rolls',
        areaUnit: isImperial ? 'sq ft' : 'm²'
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>🛠️ DIY Estimator</Text>
        
        <View style={styles.unitToggleRow}>
          <Text style={[styles.unitLabel, !isImperial && styles.activeUnitText]}>Metric</Text>
          <Switch
            trackColor={{ false: '#334155', true: '#38bdf8' }}
            onValueChange={() => { setIsImperial(!isImperial); setResult(null); }}
            value={isImperial}
          />
          <Text style={[styles.unitLabel, isImperial && styles.activeUnitText]}>Imperial</Text>
        </View>

        <View style={styles.tabBar}>
          {(['paint', 'floor', 'wallpaper'] as const).map((tab) => (
            <TouchableOpacity 
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
              onPress={() => { setActiveTab(tab); setResult(null); }}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Width ({isImperial ? 'ft' : 'm'})</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={width} onChangeText={setWidth} placeholder="0.00" placeholderTextColor="#64748b" />

          {activeTab === 'floor' ? (
            <>
              <Text style={styles.label}>Length ({isImperial ? 'ft' : 'm'})</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={length} onChangeText={setLength} placeholder="0.00" placeholderTextColor="#64748b" />
            </>
          ) : (
            <>
              <Text style={styles.label}>Height ({isImperial ? 'ft' : 'm'})</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={height} onChangeText={setHeight} placeholder="0.00" placeholderTextColor="#64748b" />
            </>
          )}

          <TouchableOpacity style={styles.btn} onPress={calculate}>
            <Text style={styles.btnText}>Calculate</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resCard}>
            <Text style={styles.resValue}>{result.material}</Text>
            <Text style={styles.resSub}>{result.unit} Needed</Text>
            <Text style={styles.resArea}>Total Area: {result.area} {result.areaUnit}</Text>
          </View>
        )}

        <View style={styles.adSection}>
          {!isExpoGo && BannerAd ? (
            <BannerAd
              unitId={__DEV__ ? TestIds.BANNER : adUnitId}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
          ) : (
            <View style={styles.adPlaceholder}>
              <Text style={styles.adPlaceholderText}>Ad Placeholder (Build version only)</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 50 },
  scrollContainer: { padding: 20 },
  header: { fontSize: 28, fontWeight: '900', color: '#f8fafc', textAlign: 'center', marginBottom: 20 },
  unitToggleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  unitLabel: { color: '#64748b', fontSize: 14, fontWeight: '700', marginHorizontal: 10 },
  activeUnitText: { color: '#38bdf8' },
  tabBar: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 15, marginBottom: 20, padding: 5 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeTabItem: { backgroundColor: '#38bdf8' },
  tabText: { color: '#94a3b8', fontSize: 12, fontWeight: '800' },
  activeTabText: { color: '#0f172a' },
  card: { backgroundColor: '#1e293b', padding: 25, borderRadius: 25 },
  label: { color: '#94a3b8', marginBottom: 8, fontSize: 13, fontWeight: '700' },
  input: { backgroundColor: '#0f172a', color: '#fff', padding: 15, borderRadius: 15, marginBottom: 20, fontSize: 18, borderWidth: 1, borderColor: '#334155' },
  btn: { backgroundColor: '#38bdf8', padding: 20, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#0f172a', fontWeight: '900', fontSize: 16 },
  resCard: { marginTop: 25, backgroundColor: '#38bdf8', padding: 25, borderRadius: 25, alignItems: 'center' },
  resValue: { color: '#0f172a', fontSize: 45, fontWeight: '900' },
  resSub: { color: '#0f172a', fontWeight: '800', fontSize: 16, marginBottom: 5 },
  resArea: { color: '#0f172a', fontSize: 12, opacity: 0.8 },
  adSection: { marginTop: 40, alignItems: 'center', minHeight: 60 },
  adPlaceholder: { padding: 20, backgroundColor: '#1e293b', borderRadius: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#334155' },
  adPlaceholderText: { color: '#64748b', fontSize: 12 }
});