import Color from "@/constants/color";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import LibraryDetail from './library/LibraryDetail';
import { useAuthStore } from '../../utils/authStore';
import { IP_ADDRESS } from '../../constants/ip';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

export const HARDCODED_LIBRARY = {
  en: [
    { title: "Smart Irrigation 2026", color: "#1565C0", icon: "water-pump", content: "New smart sensors in 2026 allow precision watering, saving up to 40% more water than traditional systems." },
    { title: "Konkan Climate Resilience", color: "#2E7D32", icon: "terrain", content: "New local varieties of Mango and Cashew are showing 30% more resistance to unseasonal rains." },
    { title: "Organic Pest Control", color: "#4CAF50", icon: "bug-stop", content: "Using Neem-based sprays and biological predators like ladybugs can reduce chemical usage by 60%." },
    { title: "Hydroponics for Small Farms", color: "#00BCD4", icon: "flower", content: "Growing leafy greens without soil allows for 3x higher yields in limited spaces." },
    { title: "Soil Health Monitoring", color: "#6D4C41", icon: "soil", content: "Portable soil testing kits now give NPK readings in under 5 minutes, helping farmers apply fertilizers more accurately." },
    { title: "Drone-Based Crop Survey", color: "#7B1FA2", icon: "drone", content: "Affordable agricultural drones can survey 10 acres in 20 minutes, detecting diseases and water stress early." },
    { title: "Intercropping Benefits", color: "#F57F17", icon: "sprout", content: "Planting Turmeric between Coconut rows can increase total farm income by up to 25% without extra land." },
    { title: "Post-Harvest Storage Tips", color: "#E64A19", icon: "warehouse", content: "Using hermetic storage bags can reduce post-harvest grain losses from 20% down to under 2%." },
    { title: "Rainwater Harvesting", color: "#0277BD", icon: "rain", content: "A simple farm pond of 30x30 ft can store enough water to irrigate 1 acre through a dry spell of 45 days." },
    { title: "Government PM-KISAN Scheme", color: "#1B5E20", icon: "rupee", content: "Eligible farmers receive ₹6,000 per year in three instalments directly into their bank account under PM-KISAN." },
    { title: "Vermicomposting at Home", color: "#558B2F", icon: "worm", content: "Converting kitchen and farm waste into vermicompost reduces input costs and improves soil organic matter by 35%." },
    { title: "Crop Insurance (PMFBY)", color: "#AD1457", icon: "shield", content: "Pradhan Mantri Fasal Bima Yojana covers yield losses due to drought, flood, and pest attacks at very low premium rates." }
  ],
  hi: [
    { title: "स्मार्ट सिंचाई 2026", color: "#1565C0", icon: "water-pump", content: "2026 में नए स्मार्ट सेंसर सटीक पानी की अनुमति देते हैं, पारंपरिक प्रणालियों की तुलना में 40% अधिक पानी की बचत करते हैं।" },
    { title: "कोंकण जलवायु लचीलापन", color: "#2E7D32", icon: "terrain", content: "आम और काजू की नई स्थानीय किस्में बेमौसम बारिश के प्रति 30% अधिक प्रतिरोध दिखा रही हैं।" },
    { title: "जैविक कीट नियंत्रण", color: "#4CAF50", icon: "bug-stop", content: "नीम आधारित स्प्रे और लेडीबग्स जैसे जैविक शिकारियों का उपयोग रसायन के उपयोग को 60% तक कम कर सकता है।" },
    { title: "छोटे खेतों के लिए हाइड्रोपोनिक्स", color: "#00BCD4", icon: "flower", content: "बिना मिट्टी के पत्तेदार साग उगाने से सीमित जगहों में 3 गुना अधिक उपज मिलती है।" },
    { title: "मिट्टी स्वास्थ्य निगरानी", color: "#6D4C41", icon: "soil", content: "पोर्टेबल मिट्टी परीक्षण किट अब 5 मिनट से कम में NPK रीडिंग देते हैं, जिससे किसान उर्वरकों को अधिक सटीकता से लगा सकते हैं।" },
    { title: "ड्रोन आधारित फसल सर्वेक्षण", color: "#7B1FA2", icon: "drone", content: "किफायती कृषि ड्रोन 20 मिनट में 10 एकड़ का सर्वेक्षण कर सकते हैं और रोग व पानी की कमी का जल्दी पता लगा सकते हैं।" },
    { title: "अंतरफसल के फायदे", color: "#F57F17", icon: "sprout", content: "नारियल की पंक्तियों के बीच हल्दी लगाने से बिना अतिरिक्त जमीन के कुल खेत आय 25% तक बढ़ सकती है।" },
    { title: "कटाई के बाद भंडारण सुझाव", color: "#E64A19", icon: "warehouse", content: "हर्मेटिक स्टोरेज बैग का उपयोग कटाई के बाद अनाज की हानि को 20% से घटाकर 2% से कम कर सकता है।" },
    { title: "वर्षा जल संचयन", color: "#0277BD", icon: "rain", content: "30x30 फीट का एक साधारण खेत तालाब 45 दिनों की सूखे अवधि में 1 एकड़ की सिंचाई के लिए पर्याप्त पानी संग्रहीत कर सकता है।" },
    { title: "सरकारी PM-KISAN योजना", color: "#1B5E20", icon: "rupee", content: "पात्र किसानों को PM-KISAN के तहत ₹6,000 प्रति वर्ष तीन किस्तों में सीधे उनके बैंक खाते में मिलते हैं।" },
    { title: "घर पर वर्मीकम्पोस्टिंग", color: "#558B2F", icon: "worm", content: "रसोई और खेत के कचरे को वर्मीकम्पोस्ट में बदलने से इनपुट लागत कम होती है और मिट्टी की कार्बनिक सामग्री 35% बढ़ती है।" },
    { title: "फसल बीमा (PMFBY)", color: "#AD1457", icon: "shield", content: "प्रधानमंत्री फसल बीमा योजना सूखे, बाढ़ और कीट हमलों से उपज के नुकसान को बहुत कम प्रीमियम दर पर कवर करती है।" }
  ],
  mr: [
    { title: "स्मार्ट सिंचन २०२६", color: "#1565C0", icon: "water-pump", content: "२०२६ मधील नवीन स्मार्ट सेन्सर अचूक पाणी देण्यास अनुमती देतात, पारंपारिक प्रणालींच्या तुलनेत ४०% जास्त पाण्याची बचत करतात." },
    { title: "कोकण हवामान लवचिकता", color: "#2E7D32", icon: "terrain", content: "आंबा आणि काजूच्या नवीन स्थानिक वाण अवकाळी पावसाला ३०% जास्त प्रतिकार दर्शवत आहेत." },
    { title: "सेंद्रिय कीड नियंत्रण", color: "#4CAF50", icon: "bug-stop", content: "लिंबोळी अर्कावर आधारित फवारण्या आणि लेडीबग्स सारख्या जैविक भक्षकांचा वापर रसायनांचा वापर ६०% पर्यंत कमी करू शकतो." },
    { title: "छोट्या शेतांसाठी हायड्रोपोनिक्स", color: "#00BCD4", icon: "flower", content: "मातीशिवाय पालेभाज्या वाढवल्याने मर्यादित जागेत ३ पट जास्त उत्पादन मिळते." },
    { title: "मातीच्या आरोग्याचे निरीक्षण", color: "#6D4C41", icon: "soil", content: "पोर्टेबल माती चाचणी किट आता ५ मिनिटांत NPK रीडिंग देतात, ज्यामुळे शेतकरी खते अधिक अचूकपणे वापरू शकतात." },
    { title: "ड्रोनद्वारे पीक सर्वेक्षण", color: "#7B1FA2", icon: "drone", content: "परवडणारे कृषी ड्रोन २० मिनिटांत १० एकर क्षेत्राचे सर्वेक्षण करू शकतात आणि रोग व पाण्याचा ताण लवकर ओळखू शकतात." },
    { title: "आंतरपीक पद्धतीचे फायदे", color: "#F57F17", icon: "sprout", content: "नारळाच्या रांगांमध्ये हळद लावल्याने अतिरिक्त जमिनीशिवाय एकूण शेत उत्पन्न २५% पर्यंत वाढू शकते." },
    { title: "काढणीनंतर साठवणूक टिप्स", color: "#E64A19", icon: "warehouse", content: "हर्मेटिक स्टोरेज बॅगचा वापर केल्याने काढणीनंतरचे धान्याचे नुकसान २०% वरून २% पेक्षा कमी होऊ शकते." },
    { title: "पावसाचे पाणी साठवणूक", color: "#0277BD", icon: "rain", content: "३०x३० फूट आकाराचे एक साधे शेततळे ४५ दिवसांच्या कोरड्या काळात १ एकर सिंचनासाठी पुरेसे पाणी साठवू शकते." },
    { title: "शासकीय PM-KISAN योजना", color: "#1B5E20", icon: "rupee", content: "पात्र शेतकऱ्यांना PM-KISAN अंतर्गत दरवर्षी ₹६,००० तीन हप्त्यांमध्ये थेट बँक खात्यात मिळतात." },
    { title: "घरी गांडूळ खत निर्मिती", color: "#558B2F", icon: "worm", content: "स्वयंपाकघर व शेतातील कचऱ्यापासून गांडूळ खत तयार केल्याने उत्पादन खर्च कमी होतो आणि जमिनीतील सेंद्रिय घटक ३५% वाढतात." },
    { title: "पीक विमा (PMFBY)", color: "#AD1457", icon: "shield", content: "प्रधानमंत्री फसल बीमा योजना दुष्काळ, पूर आणि कीड हल्ल्यांमुळे होणाऱ्या उत्पन्नाच्या नुकसानीला अत्यंत कमी प्रीमियमवर संरक्षण देते." }
  ]
};

export default function LibraryWidget() {
  const [selectedItem, setSelectedItem] = useState(null);
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState(HARDCODED_LIBRARY[i18n.language] || HARDCODED_LIBRARY['en']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = useAuthStore.getState().token;
  const router = useRouter();

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `http://${IP_ADDRESS}:3000/api/v1/aichat/library?language=${i18n.language}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        setItems(HARDCODED_LIBRARY[i18n.language] || HARDCODED_LIBRARY['en']);
        return;
      }

      const data = await response.json();
      if (data.status === 'success' && data.data && data.data.length > 0) {
        setItems(data.data);
      } else {
        setItems(HARDCODED_LIBRARY[i18n.language] || HARDCODED_LIBRARY['en']);
      }
    } catch (err) {
      setItems(HARDCODED_LIBRARY[i18n.language] || HARDCODED_LIBRARY['en']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setItems(HARDCODED_LIBRARY[i18n.language] || HARDCODED_LIBRARY['en']);
    fetchLibrary();
  }, [i18n.language]);

  const displayItems = items.slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('krishigram_library')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.push('/library-all')} style={{ marginRight: 15 }}>
                <Text style={{ color: '#2E7D32', fontWeight: 'bold' }}>{t('see_all')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => fetchLibrary()}>
                {/* <MaterialCommunityIcons name="refresh" size={20} color="#2E7D32" /> */}
            </TouchableOpacity>
        </View>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginVertical: 20 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.list}>
          {displayItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => setSelectedItem(item)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: (item.color || '#2E7D32') + '20' }]}>
                  <MaterialCommunityIcons name={item.icon || 'leaf'} size={28} color={item.color || '#2E7D32'} />
              </View>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ width: 20 }} />
        </ScrollView>
      )}

      <Modal visible={!!selectedItem} animationType="slide" onRequestClose={() => setSelectedItem(null)}>
        <LibraryDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 20,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1c1e21",
  },
  list: { paddingHorizontal: 15 },
  card: {
    width: 140,
    backgroundColor: Color.white,
    padding: 15,
    borderRadius: 16,
    marginRight: 15,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 2,
    marginBottom: 10,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  }
});
