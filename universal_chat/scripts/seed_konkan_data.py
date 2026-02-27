# Pinecone Seeding Script for Konkan Region Agriculture
import os
import time
from dotenv import load_dotenv

load_dotenv(override=True)

konkan_data = [
    {
        "topic": "Alphonso Mango (Hapus)",
        "content": "The Konkan region of Maharashtra is world-famous for the Alphonso mango (Hapus). The warm, humid climate and laterite soil are ideal for its cultivation. Major pests include the Mango Hopper, which causes flower drop and sooty mold, and the Stem Borer, which damages branches. Diseases include Powdery Mildew and Anthracnose. Management includes spraying Imidacloprid for hoppers and Hexaconazole for powdery mildew before flowering. Harvesting is done by hand-picking mature green fruits to avoid sap burn."
    },
    {
        "topic": "Cashew Cultivation in Konkan",
        "content": "Cashewnut is a major cash crop in the Konkan region (Sindhudurg, Ratnagiri, Raigad). Vengurla varieties (Vengurla 4, 7, 8) are highly recommended. Tea Mosquito Bug (TMB) is the most destructive pest, attacking tender shoots and inflorescence, causing them to dry up. Management requires a strict 3-spray schedule: Monocrotophos or Lambda-cyhalothrin at flushing, flowering, and fruit setting stages. Cashew Stem and Root Borer (CSRB) also causes tree death; treatment involves removing the grub and applying chlorpyrifos."
    },
    {
        "topic": "Rice Farming in Konkan",
        "content": "Rice is the primary food crop in the Konkan region, grown during the Kharif season due to heavy monsoon rains (2500-3000mm). The region utilizes terrace farming on hill slopes. Varieties like Ratnagiri-24, Karjat, and Sahyadri are popular. Common diseases include Rice Blast and Bacterial Leaf Blight. Pests include the Stem Borer and Brown Plant Hopper. Farmers traditionally use Rabting (burning of dried leaves and cow dung) to prepare nursery beds, though modern practices encourage tray nurseries and SRI (System of Rice Intensification)."
    },
    {
        "topic": "Coconut and Arecanut",
        "content": "Coconut and Arecanut (Betelnut) are widespread coastal crops in Konkan. For Coconuts, the Rhinoceros Beetle and Red Palm Weevil are lethal pests. Management includes placing naphthalene balls in leaf axils and using pheromone traps. Bud Rot is a serious fungal disease, treated by cleaning the crown and applying Bordeaux paste. For Arecanut, Koleroga (Fruit Rot) occurs during heavy monsoons, causing nut drop. A 1% Bordeaux mixture spray just before the monsoon is the standard preventive measure."
    },
    {
        "topic": "Kokum (Garcinia indica)",
        "content": "Kokum is an indigenous tree crop of the Konkan region, valued for its culinary and medicinal uses (making Kokum Agal and Solkadhi). It is a hardy, rainfed crop that requires very little maintenance. The tree is generally free from major pests and diseases, making it excellent for organic farming. Harvesting occurs in summer (April-May). The outer rind is sun-dried and preserved with salt."
    },
    {
        "topic": "Konkan Climate and Soil",
        "content": "The Konkan region features a humid, tropical coastal climate with heavy seasonal monsoons from June to September. The topography consists of undulating hills and coastal strips. The dominant soil type is Lateritic soil, which is acidic (pH 5.5 to 6.5), rich in iron and aluminum, but poor in nitrogen, phosphorus, and organic matter. Regular application of organic manure, FYM, and lime is recommended to improve soil fertility and crop yields."
    },
    {
        "topic": "Jackfruit and Spices",
        "content": "Jackfruit grows abundantly in Konkan, with 'Kaapa' (firm flesh) and 'Barka' (soft flesh) varieties. Spices like Black Pepper, Nutmeg, and Cinnamon are grown as intercrops in Coconut and Arecanut orchards, utilizing the microclimate and shade. Quick Wilt in black pepper is a major constraint, managed by improving drainage and applying Copper Oxychloride or Trichoderma."
    },
    {
        "topic": "Turmeric and Ginger Cultivation",
        "content": "Turmeric and Ginger are important spice crops grown in the Konkan region, especially in Sindhudurg and Ratnagiri districts. They are typically cultivated as intercrops under coconut or arecanut plantations. Varieties like Salem and Rajapuri are popular for turmeric. The major disease is Rhizome Rot (caused by Pythium and Fusarium), which thrives in waterlogged conditions. Management includes treating seed rhizomes with Mancozeb or Trichoderma viride before planting. Shoot Borer is the primary pest, controlled by spraying Dimethoate. Harvesting is done 8-9 months after planting when leaves start drying."
    },
    {
        "topic": "Banana Cultivation in Konkan",
        "content": "Banana is widely cultivated in Konkan, with varieties like Lal Velchi, Safed Velchi, and Grand Naine being popular. The crop requires well-drained loamy soil and is sensitive to waterlogging. Panama Wilt (Fusarium oxysporum) is a devastating soil-borne disease with no chemical cure — management relies on planting disease-free tissue culture plants and crop rotation. Sigatoka Leaf Spot is another common fungal disease, managed with Propiconazole sprays. Banana Stem Weevil is a major pest; regular removal of dried leaves and pseudostem debris is essential for prevention."
    },
    {
        "topic": "Fisheries and Integrated Farming",
        "content": "Coastal communities in Konkan supplement agriculture with marine and freshwater fisheries. Integrated farming systems combining paddy fields with fish ponds (Rice-Fish culture) are gaining popularity in low-lying areas. Shrimp farming (aquaculture) is practiced in brackish water zones near estuaries in Raigad and Sindhudurg. Farmers are encouraged to practice integrated crop-livestock-poultry systems to improve income, where poultry droppings serve as organic fertilizer for crops and fish ponds."
    },
    {
        "topic": "Vegetable Farming in Konkan",
        "content": "During the Rabi and summer seasons (October to May), farmers in Konkan grow vegetables like Bhendi (okra), Brinjal, Bitter Gourd, Cowpea, and leafy vegetables on river banks and valley lands. Fruit fly is a serious pest in cucurbits and brinjal, managed using Methyl Eugenol or Cue-lure pheromone traps. Damping off in nurseries is controlled using Captan or Thiram seed treatment. Drip irrigation is promoted during the dry season to ensure water efficiency, as Konkan rivers carry water year-round."
    },
    {
        "topic": "Organic Farming and Certification in Konkan",
        "content": "Konkan has significant potential for organic farming due to its biodiversity, traditional practices, and limited use of synthetic inputs in horticulture crops like Kokum, Jackfruit, and wild-grown spices. Organizations like Konkan Agro Industries and ATMA (Agricultural Technology Management Agency) promote organic certification under the NPOP (National Programme for Organic Production) framework. Key organic inputs promoted include Jeevamrut, Panchagavya, Neem-based formulations, and Trichoderma. Organic Alphonso mangoes and organic cashews fetch a significant premium in export markets."
    },
    {
        "topic": "Soil Conservation and Watershed Management",
        "content": "The hilly topography of Konkan makes it highly susceptible to soil erosion, especially during intense monsoon rains. Bunding (construction of earthen or stone bunds), terracing, and contour farming are essential soil conservation measures. Watershed development programs supported by the Maharashtra government encourage farm ponds, check dams, and percolation tanks to harvest rainwater and recharge groundwater. Agri-horticulture models — combining fruit trees with annual crops on sloping lands — are promoted to reduce runoff and improve land productivity."
    },
    {
        "topic": "Nutmeg Cultivation in Konkan",
        "content": "Nutmeg (Jaiphal) is a commercially important spice tree crop grown in Sindhudurg and Ratnagiri. It is often intercropped with coconut and arecanut. Nutmeg takes 7-8 years to bear fruit but remains productive for decades. The fruit yields both nutmeg (seed kernel) and mace (aril covering the seed), both of which have high market value. Thread Blight and Leaf Spot are common diseases, controlled with Bordeaux mixture. Nutmeg Fruit Borer is managed by collecting and destroying fallen fruits and using light traps."
    },
    {
        "topic": "Konkan Agro-Tourism",
        "content": "Agro-tourism is an emerging livelihood opportunity in Konkan, allowing farmers to open their farms to tourists during mango, cashew, and coconut harvest seasons. Visitors experience mango picking, cashew feni making, and traditional Malvani cuisine preparation. The Maharashtra Tourism Development Corporation (MTDC) actively promotes agro-tourism circuits in Ratnagiri, Sindhudurg, and Raigad. This supplements farmer income significantly and provides market linkage by enabling direct farm-to-consumer sales of value-added products like Aamras, dried kokum, and cashew products."
    },
    {
        "topic": "Post-Harvest Management of Alphonso Mango",
        "content": "Post-harvest management is critical for Alphonso mangoes due to their short shelf life. Harvested fruits are cured at ambient temperature for 24-48 hours before packing. Hot Water Treatment (HWT) at 48°C for 60 minutes is recommended to control Anthracnose and Stem-end Rot during export. Fruits are packed in single-layer CFB (Corrugated Fibre Board) boxes with paper wrapping. Cold chain storage at 12-13°C extends shelf life to 3-4 weeks. GI (Geographical Indication) tag of Alphonso mango protects its brand value in domestic and international markets."
    },
    {
        "topic": "Konkan Region Agricultural Government Schemes",
        "content": "Farmers in the Konkan region benefit from several government schemes. The Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth (DBSKKV), Dapoli, is the primary agricultural university serving the region, providing research and extension services. Key schemes include the Bhausaheb Fundkar Phalbaug Yojana for horticulture development, subsidies for drip and sprinkler irrigation, and the Pradhan Mantri Fasal Bima Yojana (PMFBY) for crop insurance. The Konkan region also benefits from the NHB (National Horticulture Board) for mango and cashew export promotion."
    }
]

def seed_konkan_database():
    print("Initializing Pinecone Seeder for Konkan Region...")
    from langchain_core.documents import Document
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_pinecone import PineconeVectorStore
    from pinecone import Pinecone, ServerlessSpec
    
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME", "konkan-agri-db")
    
    if not pinecone_api_key:
        print("Error: Missing PINECONE_API_KEY in .env")
        return
        
    pc = Pinecone(api_key=pinecone_api_key)
    
    # Check if index exists, create if not
    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]
    if index_name not in existing_indexes:
        print(f"Index '{index_name}' does not exist. Creating it now...")
        pc.create_index(
            name=index_name,
            dimension=384, # all-MiniLM-L6-v2 dimension
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
        print("Waiting for index to be ready...")
        while not pc.describe_index(index_name).status['ready']:
            time.sleep(1)
        print("Index created successfully!")
        
    documents = []
    for item in konkan_data:
        doc = Document(page_content=item["content"], metadata={"topic": item["topic"], "region": "Konkan"})
        documents.append(doc)
        
    print(f"Prepared {len(documents)} Konkan agricultural documents.")
    
    try:
        print(f"Connecting to Pinecone index: {index_name}...")
        PineconeVectorStore.from_documents(documents, embeddings, index_name=index_name)
        print("Successfully uploaded Konkan data to Pinecone!")
    except Exception as e:
        print(f"Pinecone upload failed: {e}")

if __name__ == "__main__":
    seed_konkan_database()
