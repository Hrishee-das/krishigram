import os
import json
from dotenv import load_dotenv

load_dotenv(override=True)

# Fake/seed data simulating an agricultural database
plant_data = [
    {
        "disease": "Tomato Blight",
        "content": "Tomato Early Blight is caused by the fungus Alternaria solani. Symptoms include dark concentric rings on older leaves. Organic treatments include removing infected leaves and applying copper-based fungicides or Neem Oil. Chemical treatments involve Chlorothalonil or Mancozeb applied at 2-3 tablespoons per gallon. Prevention involves crop rotation and avoiding overhead watering."
    },
    {
        "disease": "Wheat Rust",
        "content": "Wheat Leaf Rust is a fungal disease caused by Puccinia triticina. Symptoms present as small, orange-brown pustules on leaf surfaces. For organic farming, resistant wheat varieties are the primary defense. Chemical treatment includes Triazole or Strobilurin fungicides applied at flag leaf emergence. Prevention relies heavily on early detection and resistant cultivars."
    },
    {
        "disease": "Apple Scab",
        "content": "Apple Scab is caused by the fungus Venturia inaequalis. It causes olive-green to black spots on leaves and fruit. Organic controls include sweeping up fallen leaves in autumn and spraying liquid copper soap. Conventional chemical controls include Captan or Myclobutanil. Prevention involves thinning the canopy for better air circulation."
    },
    {
        "disease": "Powdery Mildew",
        "content": "Powdery mildew affects many plants, appearing as a white powdery powder on leaves. It thrives in high humidity. Organic treatments include a mix of 1 tablespoon baking soda and 1/2 teaspoon liquid soap in 1 gallon of water. Chemical treatments use sulfur-based fungicides. Prevention includes adequate spacing for airflow."
    }
]

# Appending new data for Pinecone injection
plant_data.extend([
    {
        "disease": "Potato Late Blight",
        "content": "Potato Late Blight is a devastating disease caused by the oomycete Phytophthora infestans. Symptoms include dark, water-soaked lesions on leaves, often with a white fuzzy growth on the underside in humid conditions. Stems may also turn black, and tubers develop a shallow, reddish-brown dry rot. Organic treatments include copper-based fungicides applied preventatively, and destroying infected plants immediately. Chemical treatments rely on fungicides containing chlorothalonil, mancozeb, or specialized systemic products like mefenoxam. Prevention requires using certified disease-free seed potatoes, crop rotation, and eliminating volunteer potatoes from previous seasons."
    },
    {
        "disease": "Cotton Aphids (Dry Weather)",
        "content": "Cotton Aphids (Aphis gossypii) are small, soft-bodied insects that suck sap from cotton plants, causing leaf curling, stunted growth, and the excretion of honeydew which leads to sooty mold. They are especially problematic in hot, dry weather. Organic treatments include releasing natural predators like lady beetles and lacewings, or applying insecticidal soaps and Neem Oil. Chemical treatments may require systemic insecticides like imidacloprid or thiamethoxam, but care must be taken to prevent resistance. Prevention involves avoiding excessive nitrogen fertilization and promoting beneficial insect populations."
    },
    {
        "disease": "Rice Blast",
        "content": "Rice Blast is a severe fungal disease caused by Magnaporthe oryzae. It can affect all above-ground parts of the rice plant. Leaf blast appears as diamond-shaped or spindle-shaped lesions with gray centers and brown borders. Neck blast affects the panicle, causing it to break and resulting in empty grains. Organic management relies heavily on planting resistant varieties, proper water management (avoiding drought stress), and balanced silicon fertilization. Chemical control involves timely application of fungicides like tricyclazole, isoprothiolane, or strobilurins at the booting and heading stages. Prevention includes destroying crop residues and avoiding excessive nitrogen."
    },
    {
        "disease": "Apple Scab",
        "content": "Apple Scab is caused by the fungus Venturia inaequalis. It causes olive-green to black velvety spots on leaves and fruit. Organic controls include sweeping up fallen leaves in autumn and spraying liquid copper soap early in the season. Conventional chemical controls include Captan or Myclobutanil applied from green tip until petal fall. Prevention involves thinning the canopy for better air circulation and planting resistant varieties."
    },
    {
        "disease": "Apple Rust",
        "content": "Cedar Apple Rust is a fungal disease caused by Gymnosporangium juniperi-virginianae. It presents as bright yellow-orange spots on apple leaves and fruit. It requires a juniper (like Eastern Red Cedar) as an alternate host to survive. Organic treatments focus on removing nearby junipers (within a 1-2 mile radius) or applying sulfur sprays. Chemical treatment relies on fungicides like myclobutanil at the pink bud stage. Prevention is best achieved by planting rust-resistant apple varieties."
    },
    {
        "disease": "Corn Gray Leaf Spot",
        "content": "Corn Gray Leaf Spot (Cercospora zeae-maydis) causes rectangular, pale brown to gray lesions that run parallel to the leaf veins. It thrives in high humidity and warm weather. Organic treatments consist primarily of crop rotation (at least 1-2 years away from corn) and deep tillage to bury crop debris. Chemical management involves applying foliar fungicides (like strobilurins or triazoles) at the VT (tasseling) stage if disease pressure is high. Prevention requires planting highly resistant corn hybrids."
    },
    {
        "disease": "Corn Northern Leaf Blight",
        "content": "Northern Corn Leaf Blight (Exserohilum turcicum) causes large, cigar-shaped, grayish-green to tan lesions on corn leaves. Severe infections can destroy the canopy and reduce yield significantly. Organic management relies heavily on crop rotation, burying residue, and planting resistant hybrids. Chemical treatments include prophylactic or early-symptom application of fungicides containing azoxystrobin or propiconazole. Prevention involves selecting hybrids with solid resistance genes (Ht1, Ht2, Ht3, or Htn1)."
    },
    {
        "disease": "Pepper Bell Bacterial Spot",
        "content": "Bacterial Spot of Pepper (Xanthomonas campestris pv. vesicatoria) presents as small, water-soaked, irregular spots on leaves that turn brown or black. Severe infections cause leaf drop and sunscald on the fruit. Organic treatment is difficult but includes applying copper-based bactericides preventatively. Chemical treatments combine copper sprays with mancozeb to increase efficacy. Prevention is absolutely critical: use certified disease-free seed, implement crop rotation, and avoid overhead watering."
    },
    {
        "disease": "Tomato Leaf Mold",
        "content": "Tomato Leaf Mold (Passalora fulva) primarily affects greenhouse or high-tunnel tomatoes. Symptoms include pale green or yellowish spots on the upper leaf surface, with an olive-green to brown velvety fungal growth on the underside. Organic management strictly involves lowering humidity below 85% and increasing air circulation through aggressive pruning. Chemical controls include applying chlorothalonil or mancozeb as soon as symptoms appear. Prevention focuses entirely on environmental control (ventilation and spacing)."
    },
    {
        "disease": "Grape Black Rot",
        "content": "Grape Black Rot (Guignardia bidwellii) is a devastating fungal disease. It causes small, brown circular spots on leaves and turns developing grape berries into hard, black, shriveled mummies. Organic control involves rigorous sanitation: removing all mummified fruits from vines and the ground during winter dormancy. Chemical control requires spraying fungicides (like mancozeb or myclobutanil) from early shoot growth through fruit set. Prevention requires excellent canopy management and weed control to promote rapid drying of the fruit zone."
    },
    {
        "disease": "Strawberry Leaf Spot",
        "content": "Strawberry Leaf Spot (Mycosphaerella fragariae) causes small, purple spots on leaves that gradually develop lighter gray or white centers with dark purple borders. Organic treatments include removing diseased foliage after harvest and applying copper sprays. Chemical options include fixed copper or captan fungicides. Prevention relies on planting resistant cultivars, using drip irrigation instead of overhead sprinklers, and optimizing plant spacing."
    }
])

# ── TOMATO ──────────────────────────────────
plant_data.extend([
    {
        "disease": "Tomato Bacterial Spot",
        "content": "Tomato Bacterial Spot is caused by Xanthomonas vesicatoria and related species. Symptoms appear as small, water-soaked, greasy-looking circular spots on leaves, stems, and fruit. Leaf spots turn brown with yellow halos; infected fruit develops raised, scab-like lesions. The disease spreads rapidly under warm, wet conditions and overhead irrigation. Organic treatments include copper-based bactericides, though resistance has developed in many regions. Chemical treatments combine copper hydroxide with mancozeb for improved control. Prevention includes using certified disease-free seed, hot-water seed treatment at 50°C for 25 minutes, strict crop rotation (2–3 years), and drip irrigation to keep foliage dry."
    },
    {
        "disease": "Tomato Early Blight",
        "content": "Tomato Early Blight (Alternaria solani) is one of the most common tomato diseases worldwide. It causes dark brown to black lesions with a distinctive concentric ring pattern (bull's-eye appearance) on older, lower leaves first, then progresses upward. Stems may develop dark lesions near the soil line (collar rot), and fruit can show leathery, sunken lesions near the stem. Organic controls include copper-based fungicides and Bacillus subtilis biofungicides. Chemical controls include chlorothalonil, mancozeb, or azoxystrobin fungicides applied on a 7–10 day schedule. Prevention requires mulching, staking plants to improve airflow, crop rotation, and removing infected plant debris immediately."
    },
    {
        "disease": "Tomato Late Blight",
        "content": "Tomato Late Blight (Phytophthora infestans) is the same pathogen responsible for the Irish Potato Famine. Large, irregular, water-soaked pale green lesions form on leaves and rapidly turn brown-black. White, cottony sporulation appears on the underside of leaves in wet conditions. Fruit develops large, brown, firm, greasy-looking lesions. The disease spreads explosively in cool, wet weather and can destroy an entire field within days. Organic treatments include copper-based fungicides applied preventatively. Chemical options include mancozeb, chlorothalonil, or systemics such as dimethomorph and mandipropamid. Prevention requires destroying infected plant debris, avoiding overhead irrigation, and using resistant varieties such as the 'Ph-3' gene line."
    },
    {
        "disease": "Tomato Septoria Leaf Spot",
        "content": "Septoria Leaf Spot (Septoria lycopersici) is a very common fungal disease that causes numerous small (3–6mm), circular spots with dark brown borders and lighter gray or white centers on lower leaves. Tiny black dots (pycnidia) are visible in the center of lesions under magnification. It rarely affects fruit directly but causes severe defoliation, weakening the plant and exposing fruit to sunscald. Organic treatments include copper fungicides and removing infected leaves. Chemical controls include chlorothalonil or mancozeb on a 7–10 day spray schedule. Prevention involves mulching, staking, avoiding wetting foliage, and removing volunteer tomato plants."
    },
    {
        "disease": "Tomato Spider Mite (Two-Spotted Spider Mite)",
        "content": "Two-Spotted Spider Mite (Tetranychus urticae) is a major pest of tomatoes, especially under hot, dry conditions. Infested leaves show a characteristic stippled, bronze, or silvery appearance on the upper surface, with fine webbing on the underside. Severe infestations cause leaves to yellow and drop. Organic treatments include Neem Oil, insecticidal soap, and releasing predatory mites (Phytoseiulus persimilis). Chemical miticides include abamectin, bifenazate, or spiromesifen, but rotation is critical to prevent resistance. Prevention involves avoiding water stress, which makes plants more susceptible, and regular scouting especially during dry, hot periods."
    },
    {
        "disease": "Tomato Target Spot",
        "content": "Tomato Target Spot (Corynespora cassiicola) produces brown, circular lesions with concentric rings on leaves, stems, and fruit. Lesions on fruit are sunken and can allow secondary rot organisms to enter. The disease is favored by high humidity and temperatures between 20–30°C. Organic management is limited and centers on sanitation and pruning for airflow. Chemical controls include fungicides such as azoxystrobin, boscalid, or chlorothalonil. Prevention involves crop rotation, removing plant debris, and reducing leaf wetness through canopy management and drip irrigation."
    },
    {
        "disease": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "content": "Tomato Yellow Leaf Curl Virus (TYLCV) is transmitted exclusively by the silverleaf whitefly (Bemisia tabaci). Infected plants show severe upward curling and yellowing of leaves, stunted growth, and flower drop, resulting in dramatically reduced yields. There is no cure once a plant is infected. Organic management focuses on controlling the whitefly vector using reflective mulches, yellow sticky traps, and insecticidal soaps. Chemical control of whitefly vectors uses systemic insecticides like imidacloprid or spirotetramat as soil drenches. Prevention requires using TYLCV-resistant tomato varieties, controlling weeds that harbor whiteflies, and using insect-proof netting in greenhouses."
    },
    {
        "disease": "Tomato Mosaic Virus (ToMV)",
        "content": "Tomato Mosaic Virus (ToMV) is a highly stable, mechanically transmitted Tobamovirus. Symptoms include a mosaic pattern of light and dark green on leaves, leaf distortion (fern-leaf or shoestring appearance), stunted growth, and internal fruit browning. The virus persists on tools, hands, and infected plant debris for years. There is no chemical cure. Organic and standard management involves removing and destroying infected plants, using resistant varieties (Tm-2 gene), and rigorous sanitation of tools with 10% bleach or trisodium phosphate. Prevention requires not using tobacco products near tomato plants, as the virus can be present in processed tobacco."
    },
    {
        "disease": "Tomato Healthy",
        "content": "Healthy tomato plants (Solanum lycopersicum) display deep green, turgid leaves with no spots, lesions, or distortions. Stems are sturdy, and root systems are well-developed and white. Fruit sets abundantly and develops evenly without blossom end rot or cracking. Maintaining plant health requires well-drained, fertile soil with a pH of 6.0–6.8, consistent watering to prevent blossom end rot, regular balanced fertilization, and weekly scouting for early signs of pests or disease. Good air circulation, appropriate plant spacing, and crop rotation every 3 years are the pillars of a sustainable tomato production system."
    },
])

# ── POTATO ──────────────────────────────────
plant_data.extend([
    {
        "disease": "Potato Early Blight",
        "content": "Potato Early Blight (Alternaria solani) produces dark brown, concentric ring lesions (bull's-eye pattern) primarily on older, lower leaves. Severe infections cause premature defoliation, reducing tuber size. Infected tubers show dark, sunken, corky lesions on their surface. The disease is worse under alternating wet and dry conditions. Organic management includes copper-based fungicides and removing infected foliage. Chemical options include chlorothalonil, mancozeb, or azoxystrobin. Prevention focuses on crop rotation (2–3 years), hilling soil around plants, maintaining plant vigor through balanced fertilization, and using certified, disease-free seed potatoes."
    },
    {
        "disease": "Potato Healthy",
        "content": "Healthy potato plants (Solanum tuberosum) have upright, dark green stems and compound leaves with no lesions, yellowing, or wilting. Tubers are firm, smooth-skinned, and free from blemishes or rot. Maintaining potato health requires planting in well-drained soil with a pH of 5.0–6.0, using only certified disease-free seed potatoes, hilling regularly to prevent greening, and ensuring adequate potassium fertilization for tuber quality. Crop rotation of at least 3 years away from other Solanaceous crops is the single most important preventive practice."
    },
])

# ── APPLE ───────────────────────────────────
plant_data.extend([
    {
        "disease": "Apple Black Rot",
        "content": "Apple Black Rot (Botryosphaeria obtusa) causes three distinct symptom types: frog-eye leaf spot (circular purple-bordered lesions), fruit rot (concentric rings of rot from the calyx end), and cankers on branches. Infected fruit eventually mummifies and clings to the tree, serving as a primary inoculum source. Organic management relies on sanitation: pruning out all dead or cankered wood and removing mummified fruits. Chemical controls include captan or thiophanate-methyl applied during the growing season. Prevention involves training trees to open centers for airflow, avoiding wounds, and removing nearby wild apple trees that may harbor the pathogen."
    },
    {
        "disease": "Apple Healthy",
        "content": "Healthy apple trees (Malus domestica) have bright green, blemish-free leaves, firm smooth bark, and well-structured branches. Fruit develops evenly without spots, cracking, or distortion. Maintaining apple health requires annual dormant pruning for airflow and light penetration, a complete fungicide and pest management program beginning at green tip, balanced fertilization based on soil and leaf tests, and a pH of 6.0–7.0. Regular scouting for fire blight, scab, and insect pests is essential for timely intervention."
    },
])

# ── GRAPE ───────────────────────────────────
plant_data.extend([
    {
        "disease": "Grape Esca (Black Measles)",
        "content": "Grape Esca, also called Black Measles, is a complex fungal trunk disease involving Phaeoacremonium spp. and Fomitiporia mediterranea. Symptoms include interveinal chlorosis and necrosis forming a 'tiger stripe' pattern on leaves, berry shrivel with dark spotting ('measles'), and in severe cases, sudden vine collapse (apoplexy). Internal wood shows dark streaking. There is no curative treatment. Management focuses on prevention: making clean pruning cuts during dry weather, sealing wounds with fungicidal paste, and removing and destroying severely affected vines. Avoiding large pruning wounds and staggering pruning over multiple years reduces infection risk."
    },
    {
        "disease": "Grape Leaf Blight (Isariopsis Leaf Spot)",
        "content": "Grape Leaf Blight caused by Pseudocercospora vitis (formerly Isariopsis clavispora) produces angular, dark brown to black necrotic spots on the upper leaf surface, with a dark, velvety sporulation on the underside. Severe infections cause early and widespread defoliation, weakening the vine and reducing fruit quality and cold hardiness. Organic management includes improving canopy airflow through shoot positioning and leaf removal. Chemical control relies on copper-based fungicides or mancozeb applied during periods of high humidity. Prevention involves rigorous canopy management and removing fallen leaves to reduce inoculum."
    },
    {
        "disease": "Grape Powdery Mildew",
        "content": "Grape Powdery Mildew (Erysiphe necator) is one of the most economically important grape diseases globally. It appears as a white to grayish powdery coating on all green tissues including leaves, shoots, and berries. Infected berries crack, exposing seeds, and are prone to secondary fungal rots. Unlike most fungal diseases, it does not require leaf wetness and thrives in warm days with cool nights. Organic treatments include sulfur dust or spray, potassium bicarbonate, and Neem Oil. Chemical controls include DMI fungicides (myclobutanil, tebuconazole) or QoI fungicides (azoxystrobin). Strict resistance management through fungicide rotation is essential."
    },
    {
        "disease": "Grape Healthy",
        "content": "Healthy grapevines (Vitis vinifera and other Vitis spp.) have bright green, fully expanded leaves without spots, powdery coatings, or distortion. Shoots grow vigorously and evenly, and berries develop with uniform color and firm texture. Maintaining vine health requires annual dormant pruning, a well-managed spray program for disease and pest control, balanced fertilization and irrigation, and soil pH maintenance between 5.5 and 6.5. Regular monitoring of nutrient status through petiole analysis guides fertilization decisions."
    },
])

# ── CORN (MAIZE) ────────────────────────────
plant_data.extend([
    {
        "disease": "Corn Common Rust",
        "content": "Corn Common Rust (Puccinia sorghi) produces small, oval, powdery pustules of cinnamon-brown (then black) urediniospores on both upper and lower leaf surfaces. Infections are most severe in cool (60–77°F), humid conditions. Unlike Southern Corn Rust, it does not typically cause catastrophic yield losses in temperate climates, but it can be severe in highland tropical areas. Organic management includes planting resistant hybrids and removing alternate hosts (wood sorrel, Oxalis spp.). Chemical control with strobilurin or triazole fungicides is economically justified only under high disease pressure or in sweet corn. Prevention focuses exclusively on planting rust-resistant hybrid varieties."
    },
    {
        "disease": "Corn Healthy",
        "content": "Healthy corn (Zea mays) plants have robust dark green leaves free of lesions, pustules, or discoloration. Tassels and silks emerge properly, and ear development is uniform with well-filled kernels to the tip. Corn health is maintained through proper plant populations (optimized for hybrid and geography), adequate nitrogen, phosphorus, and potassium fertilization, consistent moisture through the V6-R1 growth stages, and selecting hybrids with strong disease resistance packages. Scouting weekly from V6 through grain fill is essential for early detection of foliar diseases, pests, and nutrient deficiencies."
    },
])

# ── SOYBEAN ─────────────────────────────────
plant_data.extend([
    {
        "disease": "Soybean Frogeye Leaf Spot",
        "content": "Frogeye Leaf Spot (Cercospora sojina) produces circular lesions with reddish-brown borders and gray centers, giving a 'frog-eye' appearance, on soybean leaves, pods, and stems. It is favored by warm temperatures (25–28°C) and prolonged leaf wetness. Severe infections defoliate plants and reduce seed quality. Some populations of C. sojina are resistant to QoI fungicides (strobilurins). Chemical management requires applying triazole-based fungicides at R3 (beginning pod) stage. Organic management relies on planting resistant varieties and crop rotation. Prevention involves avoiding high plant populations that reduce airflow and removing crop residues."
    },
    {
        "disease": "Soybean Healthy",
        "content": "Healthy soybean plants (Glycine max) have trifoliate leaves with deep green color, no spots or necrosis, and well-nodulated roots (pink nodules indicate active nitrogen fixation). Pod set is abundant and uniform. Maintaining soybean health requires inoculating seed with Bradyrhizobium japonicum if soybeans have not been grown in the field before, maintaining soil pH at 6.0–6.8, proper weed control especially in early vegetative stages, and timely scouting for soybean cyst nematode, sudden death syndrome, and foliar diseases from V4 through R6."
    },
])

# ── WHEAT ───────────────────────────────────
plant_data.extend([
    {
        "disease": "Wheat Yellow Rust (Stripe Rust)",
        "content": "Wheat Yellow Rust (Puccinia striiformis f. sp. tritici) is one of the most destructive wheat diseases worldwide. It forms bright yellow-orange pustules arranged in stripes along the leaf veins. It thrives in cool (7–15°C), moist conditions and spreads rapidly via windborne spores. Yield losses can exceed 70% in susceptible varieties. Organic management is largely impractical; the primary strategy is planting resistant varieties. Chemical control with triazole fungicides (propiconazole, tebuconazole) or strobilurins applied at first sign of infection is highly effective. Prevention involves early sowing, balanced nitrogen fertilization, and avoiding dense plant populations."
    },
    {
        "disease": "Wheat Brown Rust (Leaf Rust)",
        "content": "Wheat Leaf Rust (Puccinia triticina) is the most widespread rust disease of wheat. It causes small, round to oval, orange-brown pustules scattered randomly on the upper leaf surface. Unlike yellow rust, pustules do not form in stripes. It prefers moderate temperatures (15–22°C) and is favored by dew or rain. Losses of 10–30% are common in susceptible varieties. Organic management focuses on planting resistant varieties. Chemical control uses triazole or strobilurin fungicides applied between flag leaf emergence and heading. Prevention relies heavily on cultivar selection and early planting to escape peak infection periods."
    },
    {
        "disease": "Wheat Septoria Leaf Blotch",
        "content": "Septoria Leaf Blotch (Zymoseptoria tritici) is the leading wheat disease in Europe and increasingly important globally. It causes irregular, pale green to yellow blotches that turn tan-brown with characteristic small black dots (pycnidia) visible inside the lesions. It progresses from lower leaves upward and can reach the flag leaf, severely reducing photosynthetic capacity. Organic management is limited and focuses on variety selection and delayed sowing. Chemical controls include triazoles (epoxiconazole, prothioconazole) and SDHI fungicides (bixafen, fluxapyroxad). Resistance management through mixing and rotating modes of action is critical."
    },
    {
        "disease": "Wheat Healthy",
        "content": "Healthy wheat plants (Triticum aestivum) display uniform green color from seedling through grain fill, with erect tillers, well-expanded flag leaves, and fully filled grain heads. Root systems are fibrous and white. Maintaining wheat health involves selecting varieties with strong resistance packages for local disease pressures, following recommended seeding rates and dates, ensuring balanced NPK and micronutrient nutrition, and scouting regularly from tillering through heading. Seed treatment with fungicides and insecticides provides early-season protection against seedborne diseases and aphid-transmitted viruses."
    },
])

# ── RICE ────────────────────────────────────
plant_data.extend([
    {
        "disease": "Rice Brown Spot",
        "content": "Rice Brown Spot (Bipolaris oryzae) causes oval to circular, brown lesions with a gray center and dark brown border on leaves, leaf sheaths, and glumes. It is strongly associated with nutritional deficiencies, particularly potassium and silicon. It played a major role in the 1943 Bengal Famine. Organic management includes improving soil nutrition (especially potassium and silicon) and planting tolerant varieties. Chemical control uses seed treatment with thiram or carbendazim and foliar applications of iprobenfos or edifenphos. Prevention involves maintaining soil fertility through proper fertilization and water management."
    },
    {
        "disease": "Rice Leaf Scald",
        "content": "Rice Leaf Scald (Microdochium oryzae) produces tan lesions with wavy, zonate borders resembling scalded tissue, typically beginning at leaf tips and spreading downward. It is more common in upland or irrigated rice under fluctuating water conditions. Organic management includes proper water management and balanced fertilization. Chemical control with propiconazole or carbendazim fungicides is effective when applied early. Prevention involves using resistant varieties and avoiding excessive nitrogen applications that promote dense canopies."
    },
    {
        "disease": "Rice Neck Rot",
        "content": "Rice Neck Rot is primarily caused by Magnaporthe oryzae (the same pathogen as leaf blast) attacking the neck node of the panicle. The infected neck turns dark brown or black and causes the panicle to break and fall over ('neck break'), resulting in empty or incompletely filled grains. It is the most economically devastating phase of rice blast. Chemical control requires preventive fungicide application (tricyclazole, isoprothiolane) at panicle emergence (heading stage). Prevention involves planting blast-resistant varieties, balanced nitrogen fertilization, and avoiding late planting that coincides with wet, humid weather at heading."
    },
    {
        "disease": "Rice Hispa",
        "content": "Rice Hispa (Dicladispa armigera) is an insect pest where both adults and larvae cause damage. Adults scrape the upper leaf surface, leaving white streaks; larvae mine between leaf surfaces, causing white blotches and 'windowpane' damage. Severe infestations cause complete whitening of leaves. Organic treatments include hand removal of adults, clipping and destroying mined leaves, and releasing natural parasitoids. Chemical control uses chlorpyrifos, malathion, or neonicotinoid insecticides. Prevention involves proper water management and avoiding high nitrogen applications that produce soft, palatable tissue."
    },
    {
        "disease": "Rice Healthy",
        "content": "Healthy rice plants (Oryza sativa) show uniform, deep green tillers with no lesions, streaks, or discoloration. Root systems are white and well-developed, and panicles fill completely with plump, well-colored grain. Maintaining rice health requires maintaining appropriate flood depth (5–10 cm) for weed control and blast suppression, timely transplanting or direct seeding, balanced NPK fertilization with adequate silicon and zinc supplementation, and regular scouting for blast, bacterial blight, and stem borers from seedling stage through grain fill."
    },
])

# ── CHERRY ──────────────────────────────────
plant_data.extend([
    {
        "disease": "Cherry Powdery Mildew",
        "content": "Cherry Powdery Mildew (Podosphaera clandestina) appears as a white, powdery fungal growth on young cherry leaves, shoots, and fruit. Infected leaves curl upward, and young shoots may be stunted and distorted. Unlike most fungi, it spreads by wind-dispersed conidia and does not require leaf wetness to infect. Organic controls include sulfur-based fungicides, potassium bicarbonate, and Neem Oil, all of which must be applied preventatively. Chemical options include DMI fungicides (myclobutanil) and QoI fungicides (azoxystrobin). Prevention involves pruning for canopy openness, avoiding excessive nitrogen that promotes susceptible young tissue, and selecting resistant sweet cherry varieties."
    },
    {
        "disease": "Cherry Healthy",
        "content": "Healthy cherry trees (Prunus avium for sweet cherry, P. cerasus for sour cherry) display glossy, dark green leaves, vigorous shoot growth, and firm, well-colored fruit. Bark is smooth and free of cankers or gum exudate. Maintaining cherry health requires annual pruning during dry weather to minimize infection from Leucostoma canker and brown rot, a protective fungicide program from bloom through harvest, vigilant monitoring for black cherry aphid and cherry fruit fly, and ensuring soil pH of 6.0–7.0 with good drainage to prevent root diseases."
    },
])

# ── PEACH ───────────────────────────────────
plant_data.extend([
    {
        "disease": "Peach Bacterial Spot",
        "content": "Peach Bacterial Spot (Xanthomonas arboricola pv. pruni) causes water-soaked spots on leaves that turn purple-brown and drop out, creating a 'shothole' appearance. On fruit, it causes pitting, cracking, and gum exudate, significantly reducing marketability. On shoots, it causes cankers that may girdle small branches. It is favored by warm (24–30°C), wet, windy conditions. Organic treatments include copper-based bactericides applied during the growing season, though overuse leads to copper toxicity. Chemical management uses copper-based products during dormancy and early season, and oxytetracycline during growing season where registered. Prevention relies on selecting resistant peach varieties and windbreaks to reduce abrasion and splash dispersal."
    },
    {
        "disease": "Peach Healthy",
        "content": "Healthy peach trees (Prunus persica) display bright green, lance-shaped leaves with no spots or shotholing, smooth bark, and abundant well-colored, aromatic fruit. Maintaining peach health requires annual dormant-season pruning to maintain an open vase shape, a complete spray program starting at pink bud for brown rot, leaf curl, and bacterial spot, adequate potassium and zinc nutrition, and thinning fruit to 15–20 cm spacing to improve size and quality. Peach leaf curl, caused by Taphrina deformans, is best managed with a single dormant copper spray."
    },
])

# ── SQUASH ──────────────────────────────────
plant_data.extend([
    {
        "disease": "Squash Powdery Mildew",
        "content": "Squash Powdery Mildew is caused primarily by Podosphaera xanthii and Erysiphe cichoracearum. It forms a white, talcum powder-like coating on the upper surface of leaves, then covers the entire leaf surface, causing yellowing, browning, and early senescence. Unlike most foliar diseases, it does not require free moisture and spreads in dry, warm conditions with moderate humidity. Organic controls include potassium bicarbonate, Neem Oil, and sulfur spray, applied at first signs of infection. Chemical options include myclobutanil, azoxystrobin, or trifloxystrobin. Prevention involves selecting resistant squash varieties, promoting good airflow through proper spacing, and removing infected foliage promptly."
    },
    {
        "disease": "Squash Healthy",
        "content": "Healthy squash plants (Cucurbita pepo and related species) have large, deeply lobed, dark green leaves free of powdery coatings, spots, or mosaic patterns. Vines are vigorous, and male and female flowers are produced abundantly. Fruit sets readily and develops a uniform color without deformity. Maintaining squash health involves planting in full sun with good air circulation, using drip irrigation to keep foliage dry, monitoring for cucumber beetles and squash vine borer from seedling stage, rotating cucurbit crops at minimum every 2 years, and regular scouting for aphids that transmit mosaic viruses."
    },
])

# ── ORANGE / CITRUS ─────────────────────────
plant_data.extend([
    {
        "disease": "Orange Haunglongbing (Citrus Greening)",
        "content": "Huanglongbing (HLB), or Citrus Greening, is the most devastating citrus disease worldwide, caused by the bacterium Candidatus Liberibacter asiaticus and transmitted by the Asian citrus psyllid (Diaphorina citri). Symptoms include an asymmetric, blotchy mottle on leaves (unlike the symmetric pattern of nutrient deficiency), yellowing of one or more shoots ('yellow shoot'), small, misshapen, bitter fruit with aborted seeds, and a green, underdeveloped columella. There is currently no cure. Management focuses entirely on aggressive psyllid control using systemic insecticides (imidacloprid, thiamethoxam), removing and destroying infected trees immediately upon detection, and planting certified disease-free nursery stock. Research into thermotherapy, antibiotics (oxytetracycline, penicillin), and resistant rootstocks is ongoing."
    },
    {
        "disease": "Orange Healthy",
        "content": "Healthy orange trees (Citrus sinensis) display glossy, dark green leaves with no chlorosis, mottle, or lesions. Fruit develops with typical round shape, smooth skin, and balanced juice-to-peel ratio. Maintaining citrus health in HLB-endemic areas requires a rigorous psyllid monitoring and control program, quarterly soil and foliar nutrition applications (with emphasis on zinc, manganese, and micronutrients), removal of all infected trees, and use of certified disease-free nursery transplants. Where HLB is not present, standard management focuses on root rot prevention through proper drainage and Phytophthora management."
    },
])

# ── STRAWBERRY ──────────────────────────────
plant_data.extend([
    {
        "disease": "Strawberry Leaf Scorch",
        "content": "Strawberry Leaf Scorch (Diplocarpon earlianum) causes small, irregular, dark purple spots on the upper leaf surface with no pale center (distinguishing it from leaf spot). As the disease progresses, multiple lesions merge, causing the leaf to appear scorched or burned, with reddening and drying of the tissue. Organic treatments include removing and destroying infected leaves after renovation and applying copper fungicides. Chemical controls include captan or myclobutanil. Prevention involves proper plant spacing for airflow, drip irrigation, selecting resistant cultivars, and annual renovation of June-bearing strawberry beds to remove old, infected foliage."
    },
    {
        "disease": "Strawberry Healthy",
        "content": "Healthy strawberry plants (Fragaria × ananassa) show bright green, glossy leaves with serrated edges, free of spots, scorching, or wilting. Crowns are firm and white to light brown internally. Root systems are fibrous and white. Maintaining strawberry health requires planting certified disease-free runners, using raised beds or plasticulture systems with drip irrigation, fumigating or solarizing soil before planting to manage Verticillium wilt and root rots, and following a preventive fungicide program for gray mold (Botrytis) from bloom through harvest. Renovation of matted-row systems immediately after harvest removes old foliage and reduces disease inoculum."
    },
])

# ── BELL PEPPER ─────────────────────────────
plant_data.extend([
    {
        "disease": "Pepper Bell Healthy",
        "content": "Healthy bell pepper plants (Capsicum annuum) have dark green, glossy leaves with no spots, curling, or mosaic patterns. Fruit develops with smooth, firm walls and a uniform color at maturity. Maintaining pepper health requires consistent soil moisture (avoiding both drought and waterlogging to prevent blossom end rot and Phytophthora root rot), a soil pH of 6.0–6.8, adequate calcium supplementation, and weekly scouting for aphids, thrips, and whiteflies which transmit several destructive viruses (CMV, TMV, TSWV). Using reflective mulches early in the season significantly reduces aphid and thrips landing rates."
    },
])

# ── BLUEBERRY ───────────────────────────────
plant_data.extend([
    {
        "disease": "Blueberry Mummy Berry",
        "content": "Mummy Berry (Monilinia vaccinii-corymbosi) is the most economically significant blueberry disease in North America. It has two infection phases: primary infection via ascospores in spring causes shoot strikes (wilting, browning, and death of new shoots and blossoms that resemble frost damage), and secondary infection via conidial spores causes fruit infection, turning berries into shrunken, tan or salmon-colored 'mummies' that fall to the ground. Organic management requires raking and destroying or burying mummified berries in spring before bud break. Chemical control uses protective fungicides (captan, iprodione, or myclobutanil) at early bud break and throughout bloom. Prevention centers on applying a layer of mulch over mummified berries to prevent ascospore dispersal."
    },
    {
        "disease": "Blueberry Healthy",
        "content": "Healthy blueberry bushes (Vaccinium corymbosum and related species) display bright to dark green leaves with no spots, rust pustules, or chlorosis, vigorous new shoot growth, and abundant clusters of fruit with full, waxy bloom. Blueberries have very specific nutritional and soil requirements: soil pH must be maintained strictly between 4.5 and 5.5 for proper nutrient availability, and they require well-drained, high-organic-matter soils. Maintaining blueberry health requires annual pruning to remove old unproductive wood, weed management using deep wood chip mulch, regular soil and foliar nutrient monitoring, and a spray program for mummy berry, botrytis, and mummification viruses."
    },
])

# ── GENERAL HEALTHY PLANT SUMMARIES ─────────
plant_data.extend([
    {
        "disease": "General Plant Healthy",
        "content": "A healthy plant, regardless of species, displays certain universal characteristics: vibrant, species-appropriate leaf color with no chlorosis, necrosis, or abnormal spotting; turgid stems and leaves that do not wilt in cool morning conditions; well-developed root systems with firm, light-colored roots and no signs of rot or girdling; and consistent, expected growth rates for the current season and environmental conditions. Maintaining general plant health is rooted in the principles of Integrated Pest Management (IPM): selecting the right plant for the right place, optimizing soil health through organic matter additions and pH management, providing appropriate water and nutrition, promoting beneficial insects, and monitoring regularly for the earliest signs of biotic (pest and disease) or abiotic (nutrient, water, temperature) stress."
    },
])

plant_data.extend([

    # ══════════════════════════════════════════
    # BANANA
    # ══════════════════════════════════════════
    {
        "disease": "Banana Black Sigatoka",
        "content": "Black Sigatoka (Pseudocercospora fijiensis) is the most destructive foliar disease of banana worldwide. It produces streaks on leaves that evolve into dark brown to black elliptical lesions with a pale gray center and yellow halo. Severe infection destroys leaf area, reduces fruit fill, and causes premature ripening. The disease has developed resistance to multiple fungicide classes. Organic management includes removing affected leaves promptly, improving plantation drainage, and using tolerant varieties. Chemical control requires a strict, alternating program of triazoles (propiconazole), strobilurins, and morpholines applied every 10–21 days by air or ground. Prevention involves selecting resistant hybrids (FHIA lines), maintaining canopy airflow, and strict plantation sanitation."
    },
    {
        "disease": "Banana Yellow Sigatoka",
        "content": "Yellow Sigatoka (Pseudocercospora musae) is less aggressive than Black Sigatoka but still causes significant yield losses. It produces pale yellow streaks that develop into brown cigar-shaped lesions with yellow borders on banana leaves. It thrives in humid, warm conditions. Organic management relies on removing older infected leaves (leaf stripping) and ensuring good drainage. Chemical controls include copper oxychloride or systemic fungicides such as propiconazole or tridemorph, though they are used less intensively than for Black Sigatoka. Prevention includes adequate plant spacing, weed control, and using disease-tolerant cultivars."
    },
    {
        "disease": "Banana Fusarium Wilt (Panama Disease) TR4",
        "content": "Fusarium Wilt of banana, caused by Fusarium oxysporum f. sp. cubense Tropical Race 4 (TR4), is a soilborne disease that infects roots and colonizes the vascular system, causing yellowing and wilting of older leaves, internal reddish-brown discoloration of the pseudostem, and ultimately plant death. TR4 devastates Cavendish bananas (the world's primary export variety) and has no effective chemical cure. Management is entirely preventive: strict biosecurity (quarantine, disinfection of tools and footwear), using certified disease-free planting material, soil solarization, and biological soil inoculants (Trichoderma spp., Bacillus subtilis). Resistant varieties are under development but not yet widely available commercially."
    },
    {
        "disease": "Banana Healthy",
        "content": "Healthy banana plants (Musa spp.) have upright, large, paddle-shaped leaves that are uniformly green with no streaks, lesions, or premature yellowing. Pseudostems are firm and tightly packed. Fruit develops in well-filled hands with uniform green color that ripens evenly. Maintaining banana health requires planting certified disease-free suckers or tissue culture plants, maintaining proper drainage to prevent Phytophthora root rots, regular removal of dead leaves and excess suckers (leaving only one ratoon per mat), and balanced fertilization — bananas are heavy potassium feeders requiring 300–600 g K₂O per plant per year."
    },

    # ══════════════════════════════════════════
    # MANGO
    # ══════════════════════════════════════════
    {
        "disease": "Mango Anthracnose",
        "content": "Mango Anthracnose (Colletotrichum gloeosporioides) is the most important postharvest disease of mango and also causes significant preharvest losses. Symptoms include dark, sunken lesions on leaves (starting as small black spots), flower blight (blackening and dropping of panicles), and fruit rot — starting as small black specks that expand rapidly after harvest into large, sunken, dark lesions. The pathogen remains quiescent on immature green fruit and activates as fruit ripens. Organic preharvest treatments include copper fungicide sprays from flowering through fruit development. Postharvest organic management uses hot water treatment (55°C for 5 minutes). Chemical preharvest control relies on mancozeb or azoxystrobin sprays beginning at panicle emergence. Postharvest chemical treatment includes thiabendazole or prochloraz dips. Prevention requires canopy pruning for airflow and eliminating infected plant debris."
    },
    {
        "disease": "Mango Powdery Mildew",
        "content": "Mango Powdery Mildew (Oidium mangiferae) attacks young leaves, flowers, and developing fruit, covering them with a white, powdery fungal growth. Infected flowers drop prematurely, severely reducing fruit set. Young fruit that remains develops dark russeting. Unlike most powdery mildews, mango powdery mildew is most damaging during the cooler, drier flowering season. Organic treatments include sulfur dust or wettable sulfur sprays applied at panicle emergence and repeated at 10–15 day intervals. Chemical options include hexaconazole, myclobutanil, or carbendazim. Prevention involves monitoring flowering closely and initiating sprays at the first sign of disease or at the very start of panicle emergence in high-risk years."
    },
    {
        "disease": "Mango Bacterial Canker",
        "content": "Mango Bacterial Canker (Xanthomonas campestris pv. mangiferaeindicae) causes water-soaked, irregular lesions on leaves that turn brown and crack; on fruit, it produces raised, corky, dark lesions with a water-soaked halo. Severely infected fruit becomes unmarketable. The pathogen spreads via rain splash, wind, and pruning tools. Organic management includes copper bactericides applied preventatively during flush periods and wet weather. Chemical management combines copper-based bactericides with streptomycin (where registered). Prevention involves pruning during dry weather, disinfecting tools between cuts, using resistant rootstocks, and training trees to reduce dense canopy conditions that retain moisture."
    },
    {
        "disease": "Mango Sooty Mould",
        "content": "Mango Sooty Mould is a secondary fungal condition caused by several saprophytic fungi (Capnodium spp., Meliola spp.) that grow on the honeydew excreted by sap-sucking insects, particularly mango hoppers (Idioscopus spp.) and mealybugs. The resulting black, sooty coating covers leaves and fruit surfaces, blocking photosynthesis and making fruit unmarketable. Control focuses on managing the insect vectors: organic treatments include Neem Oil spray and introducing natural predators (lacewings, ladybird beetles). Chemical control of the insect vectors uses imidacloprid or dimethoate, after which the sooty mould gradually weathers away. Prevention involves monitoring for hopper populations at bud break and spraying immediately if populations exceed threshold levels."
    },
    {
        "disease": "Mango Healthy",
        "content": "Healthy mango trees (Mangifera indica) display glossy, dark green mature leaves that flush with characteristic coppery-red or pink new growth. Panicles are large, well-developed, and produce abundant fruit set. Fruit develops with smooth skin, uniform shape, and no lesions or russeting. Maintaining mango health requires annual or biennial pruning after harvest to manage tree size and stimulate uniform flushing, a complete spray program beginning at panicle emergence for powdery mildew and anthracnose, balanced nutrition (emphasis on potassium and boron during flowering), and monitoring for mango hoppers, fruit fly, and stem-end rot pathogens."
    },

    # ══════════════════════════════════════════
    # CASSAVA
    # ══════════════════════════════════════════
    {
        "disease": "Cassava Mosaic Disease",
        "content": "Cassava Mosaic Disease (CMD) is caused by a complex of begomoviruses (Cassava Mosaic Virus, African Cassava Mosaic Virus, and related species) transmitted by the whitefly Bemisia tabaci. It is the most economically important disease of cassava in Africa, causing yield losses of 20–90%. Symptoms include mosaic (yellow-green mottling), distortion, and reduction of leaves, leading to stunted plants and small, fibrous roots. There is no chemical cure for the virus. Organic and standard management centers on using certified disease-free stem cuttings, planting resistant or tolerant cassava varieties (developed through IITA and CIMMYT programs), controlling whitefly vector populations with Neem Oil or reflective mulches, and roguing (removing and destroying) infected plants immediately. Biological control of whiteflies using parasitic wasps (Encarsia spp.) is being deployed in Africa."
    },
    {
        "disease": "Cassava Brown Streak Disease",
        "content": "Cassava Brown Streak Disease (CBSD) is caused by Cassava brown streak virus (CBSV) and Ugandan cassava brown streak virus (UCBSV), transmitted by whiteflies and through infected planting material. It is currently the most devastating cassava disease in East Africa. Symptoms include a distinctive yellow-green chlorosis along leaf veins and brown streaking on stems. Most critically, the storage roots develop a dry, necrotic, brown corky rot internally, making roots inedible — even when the plant appears relatively healthy aboveground. There is no chemical cure. Management relies entirely on planting certified CMD/CBSD-resistant varieties, using disease-free stem cuttings, and aggressive whitefly vector control. Rapid diagnostic tools (LAMP assay) allow early detection in planting material."
    },
    {
        "disease": "Cassava Bacterial Blight",
        "content": "Cassava Bacterial Blight (Xanthomonas axonopodis pv. manihotis) causes angular, water-soaked leaf spots with yellow halos, wilting and die-back of stems (canker phase), and a systemic vascular wilt in severe cases. The disease is most destructive during the wet season and spreads via infected planting material and splashing rain. Organic management includes using disease-free stem cuttings, removing and burning infected plant material, and maintaining field sanitation. Copper bactericides have limited efficacy. Chemical controls include copper-based products applied preventatively during wet periods. Prevention involves sourcing stem cuttings from certified disease-free sources, pruning with disinfected tools, crop rotation, and planting resistant varieties."
    },
    {
        "disease": "Cassava Healthy",
        "content": "Healthy cassava plants (Manihot esculenta) display palmate, deep green leaves with no mosaic, chlorosis, or distortion. Stems are erect and firm with no streaking or die-back. Storage roots are large, firm, and uniformly white to cream inside with no brown necrosis or rotting. Maintaining cassava health requires using certified, disease-free stem cuttings (setts) from the middle portion of healthy stems, planting in well-drained soil, regular weeding especially in the first 3 months, and harvesting at the correct maturity (typically 9–12 months for sweet varieties, up to 24 months for some bitter varieties) to prevent root deterioration."
    },

    # ══════════════════════════════════════════
    # COTTON
    # ══════════════════════════════════════════
    {
        "disease": "Cotton Bacterial Blight",
        "content": "Cotton Bacterial Blight (Xanthomonas citri pv. malvacearum) is a seedborne and windborne disease causing angular, water-soaked leaf spots bounded by leaf veins that turn brown-black with yellow halos. It also causes black arm (stem canker), boll rot, and in severe cases systemic vascular wilt. It can dramatically reduce fiber quality. Organic and standard management begins with using certified disease-free, acid-delinted seed. Copper bactericides provide partial protection when applied at first sign of symptoms. Prevention includes crop rotation (at least 2 years out of cotton), planting resistant varieties, avoiding field operations when foliage is wet, and avoiding fields with a history of severe outbreaks."
    },
    {
        "disease": "Cotton Fusarium Wilt",
        "content": "Cotton Fusarium Wilt (Fusarium oxysporum f. sp. vasinfectum) is a soilborne vascular disease causing yellowing of leaves on one side of the plant, stunting, and a characteristic brown to black discoloration of the vascular tissue in the stem. The disease is highly persistent in soil (15+ years) and is exacerbated by root knot nematode co-infection. There is no curative treatment. Organic management includes soil solarization, adding organic matter to promote suppressive soil microbiomes, and biocontrol with Trichoderma spp. Chemical management uses in-furrow fungicide treatments (thiophanate-methyl) at planting. Prevention requires planting resistant or tolerant cotton varieties and implementing nematode management programs (cover crops, fumigation)."
    },
    {
        "disease": "Cotton Verticillium Wilt",
        "content": "Cotton Verticillium Wilt (Verticillium dahliae) is the most economically damaging soilborne disease of cotton in temperate production regions. Symptoms include interveinal chlorosis forming a distinctive 'tiger stripe' or 'acute' defoliation pattern, stunting, and premature boll opening. Internal stem vascular tissue shows tan to brown discoloration. V. dahliae produces melanized microsclerotia that persist in soil for decades. There is no curative treatment. Chemical soil fumigation (with metam sodium) provides partial suppression. Organic management includes crop rotation with non-host crops (small grains, corn), cover cropping, and soil health improvement to encourage suppressive microbiota. Prevention involves planting tolerant varieties and avoiding fields with heavy disease history for as long as possible."
    },
    {
        "disease": "Cotton Healthy",
        "content": "Healthy cotton plants (Gossypium hirsutum and G. barbadense) have palmately lobed, dark green leaves, sturdy erect stems, and abundant square (bud) and boll development. Plants are well-nodded with appropriately spaced internodes indicating balanced growth. Fiber quality is optimized through proper nitrogen management (avoiding late-season luxury nitrogen that delays maturity), timely irrigation and cut-off of irrigation at cut-out (NAWF≤5), aggressive boll weevil and pink bollworm monitoring, and applying plant growth regulators (mepiquat chloride) to prevent excessive vegetative growth. Early termination of insecticide programs encourages beneficial insects."
    },

    # ══════════════════════════════════════════
    # SUGARCANE
    # ══════════════════════════════════════════
    {
        "disease": "Sugarcane Red Rot",
        "content": "Sugarcane Red Rot (Colletotrichum falcatum) is the most destructive disease of sugarcane in Asia and India. It primarily affects the stalk internally, causing a characteristic red discoloration of internal tissues with white patches across the reddened area. Externally, infected stalks may show yellowing of leaves and drying. The pathogen is spread by infected setts (seed pieces). Organic management includes hot water treatment of setts at 50°C for 2 hours before planting. Chemical treatment involves thiram or carbendazim fungicide treatment of setts. Prevention requires using disease-resistant varieties (the primary strategy), crop rotation, and selecting setts only from disease-free seed plots."
    },
    {
        "disease": "Sugarcane Smut",
        "content": "Sugarcane Smut (Sporisorium scitamineum) causes a characteristic whip-like, black, curved structure (smut whip) to emerge from the growing point of infected plants. The whip is composed of mass of black teliospores. Infected plants are stunted, produce thin, grass-like tillers, and yield no economically viable cane. The disease spreads via windborne spores infecting seed setts at planting. Organic management involves hot water treatment of setts (52°C for 30 minutes) and roguing (removing and destroying) smut-affected plants before whips rupture. Chemical control includes propiconazole fungicide dip or spray of setts before planting. Prevention focuses on planting smut-resistant varieties and sourcing planting material from disease-free nurseries."
    },
    {
        "disease": "Sugarcane Yellow Leaf Disease",
        "content": "Sugarcane Yellow Leaf Disease (YLD) is caused by Sugarcane yellow leaf virus (SCYLV), transmitted by the sugarcane aphid (Melanaphis sacchari) and through infected planting material. Symptoms include a striking yellowing of the midrib on the underside of the leaf, progressing to complete leaf yellowing and death from the tip downward on older leaves. Infected plants show stunted growth and reduced sucrose content. There is no chemical cure. Management relies on using YLD-free planting material (through tissue culture or thermotherapy), controlling aphid vectors with Neem Oil or systemic insecticides, and planting tolerant varieties. Regular roguing of symptomatic plants helps slow spread."
    },
    {
        "disease": "Sugarcane Healthy",
        "content": "Healthy sugarcane plants (Saccharum officinarum and hybrid varieties) display tall, erect stalks with tight, overlapping sheaths and uniformly green, broad leaves with no yellowing, smut whips, or lesions. Stalk internodes are uniformly shaped with no internal reddening or softness. Maintaining sugarcane health requires planting from certified, disease-free seed setts, hot water treatment of setts before planting, balanced fertilization (sugarcane requires large amounts of nitrogen and potassium), adequate irrigation especially during the grand growth period, and regular monitoring for early shoot borer, internode borer, and stalk diseases."
    },

    # ══════════════════════════════════════════
    # GROUNDNUT / PEANUT
    # ══════════════════════════════════════════
    {
        "disease": "Groundnut Early Leaf Spot",
        "content": "Groundnut Early Leaf Spot (Cercospora arachidicola) produces circular lesions with dark brown centers and yellow halos on leaves, petioles, and stems. Lesions appear first on the upper leaf surface. Severe infections cause significant defoliation, reducing pod fill and yield by 10–50%. Organic management includes removing crop debris, practicing crop rotation (2–3 years), and applying Neem-based sprays. Chemical control uses chlorothalonil, mancozeb, or tebuconazole applied on a 14-day schedule from 30 days after planting. Prevention involves planting resistant or tolerant varieties and avoiding excessive plant densities that maintain humid canopy conditions."
    },
    {
        "disease": "Groundnut Late Leaf Spot",
        "content": "Groundnut Late Leaf Spot (Phaeoisariopsis personata) produces darker, rounder lesions than early leaf spot, primarily on the underside of leaves, with a velvety dark sporulation visible with the naked eye. It appears later in the season but is generally more severe and defoliating. Organic and chemical management mirrors that of early leaf spot, with chlorothalonil or mancozeb sprays on a 14-day schedule. In many regions both diseases occur together and are managed simultaneously. Prevention focuses on planting resistant varieties and practicing a minimum 2-year rotation away from groundnuts."
    },
    {
        "disease": "Groundnut Rust",
        "content": "Groundnut Rust (Puccinia arachidis) produces small, orange-red pustules primarily on the underside of leaves, causing yellowing and premature defoliation. It can spread explosively in humid conditions and wind-dispersed urediniospores travel long distances. Severe early infections can cause losses of 50–70%. Organic management includes crop rotation and removing volunteer groundnut plants. Chemical control uses triadimefon, propiconazole, or tebuconazole fungicides applied when rust is first detected. Chlorothalonil provides good protective control. Prevention involves planting rust-resistant varieties and avoiding late-planted crops in areas of high rust pressure."
    },
    {
        "disease": "Groundnut Aflatoxin (Aspergillus flavus)",
        "content": "Aflatoxin contamination of groundnuts, caused by the soil fungus Aspergillus flavus, is a critical food safety issue rather than a typical plant disease. The fungus infects pods and seeds under drought stress (especially during pod fill), physical damage to pods by soil insects, and high soil temperatures. Aflatoxins are potent carcinogens and cause significant economic losses through rejection of contaminated lots. Organic management includes using biocontrol strains of A. flavus (Afla-Guard, AF36) that competitively exclude aflatoxin-producing strains. Chemical options are limited; calcium and gypsum application during pegging reduces infection. Prevention requires avoiding drought stress during pod fill (critical irrigation window), harvesting at correct maturity, and drying pods rapidly to below 9% moisture after harvest."
    },
    {
        "disease": "Groundnut Healthy",
        "content": "Healthy groundnut plants (Arachis hypogaea) display bright green, pinnate leaves with no spots, pustules, or yellowing. Stems are erect and well-branched, and pegs penetrate the soil successfully to form well-developed pods. Root systems show active nitrogen-fixing nodules (pink interior). Maintaining groundnut health requires inoculating seed with Bradyrhizobium spp. if growing in a new field, maintaining soil calcium levels with gypsum applications at pegging (critical for pod fill), implementing a 2–3 year rotation with non-legume crops, ensuring soil pH of 5.8–6.2, and managing leaf spot diseases with timely fungicide applications."
    },

    # ══════════════════════════════════════════
    # CHICKPEA / LENTIL / PULSE
    # ══════════════════════════════════════════
    {
        "disease": "Chickpea Ascochyta Blight",
        "content": "Ascochyta Blight of chickpea (Ascochyta rabiei) is the most devastating foliar disease of chickpeas globally. It produces tan-brown, circular lesions with dark borders and concentric rings on leaves, stems, and pods. Stem lesions can girdle and kill the entire plant. Pod lesions penetrate to infect seed. It spreads explosively under wet, cool conditions via rain-splashed pycnidiospores. Organic management includes crop rotation (minimum 2 years), using certified disease-free seed, and avoiding overhead irrigation. Chemical control requires seed treatment with thiram plus carbendazim and foliar applications of chlorothalonil, mancozeb, or tebuconazole beginning at first sign of disease. Prevention focuses on planting resistant varieties and using clean seed from disease-free crops."
    },
    {
        "disease": "Lentil Rust",
        "content": "Lentil Rust (Uromyces viciae-fabae) produces small, round, orange-brown uredinia (pustules) on leaves and stems of lentil plants. Severe infections cause premature defoliation and significant yield losses, particularly in South Asia and the Middle East. Organic management relies primarily on crop rotation and planting resistant varieties. Chemical control with triadimefon, propiconazole, or chlorothalonil applied at first signs of infection is effective. Prevention involves avoiding late planting (which exposes plants to peak rust pressure), monitoring fields from the vegetative stage, and using certified disease-free seed."
    },
    {
        "disease": "Faba Bean Chocolate Spot",
        "content": "Chocolate Spot of faba bean (Botrytis fabae) is the most important disease of faba bean globally. It causes reddish-brown, circular spots on all above-ground parts. In aggressive (aggressive) form under wet conditions, lesions coalesce causing complete necrosis of stems and defoliation — the plant appears scorched. In non-aggressive form, lesions remain small and discrete. Organic management includes crop rotation, proper plant spacing, and avoiding high nitrogen applications that produce lush, susceptible growth. Chemical control uses carbendazim, chlorothalonil, or iprodione fungicides applied preventatively at flowering. Prevention involves using tolerant varieties and field selection — avoid low-lying, poorly drained areas."
    },

    # ══════════════════════════════════════════
    # ONION / GARLIC
    # ══════════════════════════════════════════
    {
        "disease": "Onion Purple Blotch",
        "content": "Onion Purple Blotch (Alternaria porri) causes distinctive lesions — initially small white spots with purple-brown centers that expand to form large, zonate, sunken lesions with a reddish-purple margin and yellow halo on onion leaves. Severe infections cause complete leaf collapse. It is favored by hot, humid conditions and thrives when leaves are wet for extended periods. Organic management includes crop rotation and copper-based fungicides. Chemical controls include iprodione, tebuconazole, or azoxystrobin fungicides applied on a 7–10 day schedule when disease pressure is high. Prevention involves using drip irrigation, ensuring proper plant spacing, and avoiding nitrogen over-application."
    },
    {
        "disease": "Onion Downy Mildew",
        "content": "Onion Downy Mildew (Peronospora destructor) produces a gray-violet, downy fungal growth on leaves under cool, humid conditions, causing pale yellow lesions and eventually leaf collapse. The pathogen can persist in bulbs and infect the following crop. Organic management includes removing volunteer onion plants, improving airflow through wider spacing, and copper-based fungicides. Chemical control requires preventive applications of mancozeb, chlorothalonil, or metalaxyl-M/mancozeb mixture. Prevention involves planting in well-drained fields with good airflow, using certified pathogen-free sets or transplants, and avoiding overhead irrigation."
    },
    {
        "disease": "Garlic White Rot",
        "content": "Garlic White Rot (Sclerotium cepivorum) is a devastating soilborne fungal disease affecting all Allium crops. White, fluffy mycelium grows around the base of infected bulbs, and numerous small (0.3–0.5 mm), black, spherical sclerotia form on the rotten tissue. Infected plants wilt and die. Sclerotia survive in soil for 20+ years and germinate only in response to volatile compounds from Allium roots. There is no practical cure. Organic management includes long rotations away from all Allium crops, solarization, and biological control with Trichoderma spp. Chemical treatments include tebuconazole or iprodione applied as furrow treatments at planting. Prevention relies on using certified disease-free planting stock and avoiding introduction of contaminated soil on equipment."
    },

    # ══════════════════════════════════════════
    # CABBAGE / BRASSICA
    # ══════════════════════════════════════════
    {
        "disease": "Cabbage Black Rot",
        "content": "Cabbage Black Rot (Xanthomonas campestris pv. campestris) is the most serious bacterial disease of brassica crops worldwide. Symptoms begin at leaf margins as V-shaped, yellow chlorotic lesions that spread inward, turning brown and necrotic. Leaf veins turn black (hence 'black rot'), and in severe cases the entire head is affected with a black, slimy rot. Organic management includes crop rotation (minimum 2 years away from brassicas), using certified disease-free transplants, and avoiding overhead irrigation. Copper bactericides provide partial control when applied preventatively. Prevention absolutely requires using hot-water-treated seed (50°C for 30 minutes) or certified pathogen-free transplants, and selecting resistant varieties."
    },
    {
        "disease": "Cabbage Clubroot",
        "content": "Clubroot of brassica (Plasmodiophora brassicae) is a soilborne disease causing massive, distorted gall formation on roots (clubs), which disrupts water and nutrient uptake. Above-ground symptoms include wilting during warm days, stunted growth, and yellowing. Affected plants rarely produce marketable heads. The pathogen produces resting spores that persist in soil for 15–20 years and germinate only in the presence of brassica root exudates. Organic management includes liming soil to pH 7.0–7.2 (which significantly reduces infection), long rotations (5–7 years) away from all brassicas, and removing all infected plant material. Chemical control uses soil applications of fluazinam or cyazofamid at transplanting. Prevention is the only reliable strategy: use resistant varieties, raise transplant pH, and avoid moving soil from infested fields."
    },
    {
        "disease": "Cabbage Downy Mildew",
        "content": "Cabbage Downy Mildew (Hyaloperonospora parasitica) produces yellow patches on the upper leaf surface with a white to grayish-purple downy fungal growth on the underside. It is most destructive on seedlings and young transplants, causing damping-off and post-emergence death. On mature plants, it causes cosmetic damage that reduces market value. Organic management includes good seedling sanitation, wide spacing, and copper sprays. Chemical control uses mancozeb, metalaxyl, or dimethomorph fungicides applied preventatively. Prevention involves avoiding overcrowding in transplant beds, using resistant varieties, and managing irrigation to minimize leaf wetness duration."
    },
    {
        "disease": "Cauliflower Healthy",
        "content": "Healthy cauliflower (Brassica oleracea var. botrytis) plants have broad, blue-green, upright leaves free of spots, lesions, or V-shaped yellowing. The curd (head) is dense, white, and compact with no browning, riciness, or purpling. Maintaining cauliflower health requires consistent soil moisture (stress during curd development causes hollow stem and browning), adequate boron nutrition (deficiency causes hollow stem and browning of the curd interior), soil pH of 6.5–7.0, crop rotation of 3–4 years away from all brassicas, and protection of the developing curd from sun by tying leaves over it (blanching) in susceptible varieties."
    },

    # ══════════════════════════════════════════
    # CUCUMBER / CUCURBIT
    # ══════════════════════════════════════════
    {
        "disease": "Cucumber Downy Mildew",
        "content": "Cucumber Downy Mildew (Pseudoperonospora cubensis) is the most economically important disease of cucumbers globally. It causes angular, yellow-green to brown lesions limited by leaf veins on the upper leaf surface, with a dark gray-purple, downy sporulation on the underside in humid conditions. The disease spreads extremely rapidly via windborne sporangia and can destroy a cucumber crop within 7–10 days of onset. Organic management includes selecting resistant varieties (now available for many cucumber types), using Bacillus-based biofungicides, and minimizing leaf wetness. Chemical control requires preventive application of mancozeb or chlorothalonil, with a strict rotation into systemic fungicides (cymoxanil + mancozeb, dimethomorph, or propamocarb) to manage resistance. Prevention centers entirely on resistant variety selection."
    },
    {
        "disease": "Cucumber Mosaic Virus (CMV)",
        "content": "Cucumber Mosaic Virus (CMV) has the widest host range of any known plant virus (1,000+ plant species) and is transmitted by more than 80 aphid species in a non-persistent manner. Symptoms on cucumber include mosaic mottling, puckering and distortion of leaves, stunted plants, and misshapen, bumpy, or discolored fruit (sometimes with a 'shoestring' appearance). There is no chemical cure. Organic and standard management focuses on controlling aphid vectors using reflective silver mulches, insecticidal soap, or Neem Oil. Chemical control of aphid vectors uses pyrethroids or neonicotinoids, though non-persistent transmission means vector control is often insufficient. Prevention involves removing weed hosts (particularly chickweed, milkweed), using mineral oil sprays to reduce transmission efficiency, and planting CMV-resistant varieties."
    },
    {
        "disease": "Watermelon Gummy Stem Blight",
        "content": "Gummy Stem Blight (Stagonosporopsis cucurbitacearum, formerly Didymella bryoniae) affects all cucurbits but is particularly severe on watermelon and melon. Symptoms include oval to irregular, tan-brown lesions on leaves and stems, often with a characteristic amber or reddish-brown gummy exudate oozing from stem lesions (cankers). Vine collapse can occur rapidly. Fruit develops water-soaked lesions that become black rot. Organic management includes removing infected vines, improving airflow through proper spacing, and copper sprays. Chemical control requires a preventive program using azoxystrobin, boscalid, or chlorothalonil beginning at transplanting or early vine development. Prevention involves using disease-free transplants, crop rotation (3 years), and selecting resistant melon varieties."
    },

    # ══════════════════════════════════════════
    # LETTUCE
    # ══════════════════════════════════════════
    {
        "disease": "Lettuce Downy Mildew",
        "content": "Lettuce Downy Mildew (Bremia lactucae) is the most important disease of lettuce globally. It causes pale yellow spots on the upper leaf surface, with a white to pale gray downy sporulation on the underside. The pathogen has hundreds of races and new races rapidly overcome resistant varieties. Cool, humid conditions favor rapid disease development. Organic management focuses on airflow management, avoiding overhead irrigation, and using copper-based fungicides. Chemical control uses mancozeb, cymoxanil, or mandipropamid applied preventatively. Prevention relies on planting the latest race-specific resistant varieties (tracking current race populations is essential), avoiding dense planting, and managing night ventilation in greenhouses."
    },
    {
        "disease": "Lettuce Big Vein Disease",
        "content": "Lettuce Big Vein Disease is caused by Mirafiori lettuce big-vein ophiovirus (MLBVV) and Lettuce big-vein associated virus (LBVaV), both transmitted by the soilborne water mold Olpidium virulentus. Symptoms include pronounced clearing and thickening of leaf veins, leaf blistering, and occasional stunting. Affected heads are often poorly blanched and may be wavy or ruffled. The vector persists in soil for decades in resistant resting spores. There is no practical chemical control for the soilborne vector. Management focuses on improving soil drainage, using resistant or tolerant lettuce varieties (available in commercial breeding programs), avoiding cold, wet soils that favor Olpidium, and soil solarization where feasible."
    },

    # ══════════════════════════════════════════
    # TOMATO (additional)
    # ══════════════════════════════════════════
    {
        "disease": "Tomato Fusarium Wilt",
        "content": "Tomato Fusarium Wilt (Fusarium oxysporum f. sp. lycopersici) is a soilborne vascular disease causing yellowing that typically begins on one side of the plant or one side of a leaf. Infected stems show a characteristic brown discoloration of vascular tissue when cut. The disease progresses to complete wilting and plant death. The pathogen has three races (Race 1, Race 2, Race 3), and resistant varieties carry the 'I' gene. Organic management includes soil solarization, Trichoderma spp. soil inoculants, and grafting susceptible varieties onto resistant rootstocks. Chemical soil fumigation (metam sodium) reduces inoculum levels. Prevention relies primarily on planting race-appropriate resistant varieties and a 3–5 year rotation out of tomatoes and other Solanaceous crops."
    },
    {
        "disease": "Tomato Verticillium Wilt",
        "content": "Tomato Verticillium Wilt (Verticillium dahliae and V. albo-atrum) causes a distinctive V-shaped, yellow lesion at the margin of older leaves, with browning of leaf veins, followed by leaf death progressing up the plant. Vascular tissue in stems shows a light brown discoloration. Plants rarely die but are significantly stunted and produce reduced yields. The pathogen persists in soil indefinitely via melanized microsclerotia. Organic management includes soil solarization and organic matter additions. Chemical fumigation with metam sodium provides partial suppression. Prevention focuses on planting Verticillium-resistant varieties (Ve gene), using long rotations with small grains or corn, and grafting onto resistant rootstocks."
    },
    {
        "disease": "Tomato Crown and Root Rot",
        "content": "Tomato Crown and Root Rot (Fusarium oxysporum f. sp. radicis-lycopersici, FORL) causes a distinctive rotting of the crown and roots of tomato at or below the soil surface. Brown-black lesions girdle the stem at the soil line; roots become dark brown and rotted. Infected plants wilt suddenly, often when under stress, and die rapidly. Unlike Fusarium wilt, FORL causes root rot in addition to crown lesions and can infect resistant varieties. Organic management includes Trichoderma-based biocontrol applied to the root zone. Chemical control uses fungicide drenches of thiabendazole or azoxystrobin at transplanting. Prevention involves deep planting to encourage adventitious rooting above the lesion, maintaining soil moisture consistency, and using grafted plants on resistant rootstocks."
    },

    # ══════════════════════════════════════════
    # COFFEE
    # ══════════════════════════════════════════
    {
        "disease": "Coffee Leaf Rust",
        "content": "Coffee Leaf Rust (Hemileia vastatrix) is the most economically devastating disease in the history of coffee production — it virtually eliminated Sri Lanka's coffee industry in the 1870s and currently causes annual losses exceeding $1 billion globally. It produces orange-yellow, powdery urediniospores on the underside of leaves, forming characteristic hexagonal-shaped colonies. Heavily infected leaves drop, causing severe defoliation that reduces photosynthetic capacity and results in branch die-back. Organic management includes copper-based fungicides (Bordeaux mixture) applied preventatively at onset of the rainy season. Chemical control requires systemic triazole fungicides (triadimefon, cyproconazole) for curative action. Prevention relies on planting resistant varieties (Catimor, Sarchimor, and other Timor hybrid derivatives), shade management, and maintaining proper nutrition — deficient plants are far more susceptible."
    },
    {
        "disease": "Coffee Berry Borer",
        "content": "Coffee Berry Borer (Hypothenemus hampei) is the most damaging insect pest of coffee worldwide, causing losses exceeding $500 million annually. The female beetle bores into the coffee cherry through the disco, lays eggs inside the endosperm, and the larvae feed on and destroy the developing coffee bean. Damage includes bean destruction (direct loss), premature fruit drop, and secondary fungal infection. Organic management includes Beauveria bassiana (an entomopathogenic fungus) applied as a spray, maintaining harvest sanitation (removing all remaining cherries after picking), and promoting natural parasitoids (Cephalonomia stephanoderis). Chemical control with endosulfan (now banned in many countries) or spinosad insecticides applied at the red fruit stage. Prevention involves timely and thorough harvesting to deny the pest entry points."
    },
    {
        "disease": "Coffee Healthy",
        "content": "Healthy coffee plants (Coffea arabica and C. canephora) display deep green, glossy, oval leaves with no orange pustules, leaf curl, or defoliation. Stems are well-branched with laterals bearing abundant flower clusters (jasmine-scented in C. arabica). Cherry development is even, moving from green through yellow to deep red (or yellow in yellow-fruited varieties). Maintaining coffee health requires adequate shade (30–40% for C. arabica), balanced NPK and magnesium nutrition, a preventive copper spray program against leaf rust starting at the onset of the rainy season, timely and complete harvesting, and periodic pruning of old unproductive wood to stimulate new productive lateral growth."
    },

    # ══════════════════════════════════════════
    # CACAO / COCOA
    # ══════════════════════════════════════════
    {
        "disease": "Cacao Black Pod Disease",
        "content": "Cacao Black Pod Disease (Phytophthora megakarya in West Africa, P. palmivora globally) is the most important disease of cocoa, causing losses of 20–30% of global production annually. It rapidly rots developing pods, turning them dark brown to black within days. The pathogen also attacks seedlings, stems (causing cankers), and roots. It spreads via rain splash, irrigation, contaminated tools, and through the soil. Organic management includes removing and destroying all infected pods promptly (sanitation is the single most important practice), improving plantation drainage, and applying Bordeaux mixture or copper-based fungicides. Chemical control uses metalaxyl-M or cymoxanil-based fungicides in combination with copper. Prevention involves selecting tolerant cocoa clones, proper plantation spacing for canopy airflow, and implementing a strict pod sanitation schedule every 2 weeks."
    },
    {
        "disease": "Cacao Swollen Shoot Disease",
        "content": "Cacao Swollen Shoot Disease (CSSVD) is caused by Cacao swollen shoot virus (CSSV), a badnavirus transmitted by mealybugs (primarily Planococcus citri and Pseudococcus spp.). Symptoms include swelling of feeder roots and stems, red vein banding on young leaves, mosaic patterns on mature leaves, leaf size reduction, defoliation, and gradual decline over 3–5 years. It has devastated cocoa farming in West Africa, particularly Ghana. There is no chemical cure. Management requires immediate removal and destruction (cutting and swabbing with herbicide) of all infected and surrounding buffer trees (up to 4 trees in each direction). Control of mealybug vectors with insecticides (chlorpyrifos) slows spread. Prevention involves regular inspection, early detection, and planting tolerant varieties developed through breeding programs."
    },

    # ══════════════════════════════════════════
    # TEA
    # ══════════════════════════════════════════
    {
        "disease": "Tea Blister Blight",
        "content": "Tea Blister Blight (Exobasidium vexans) is the most important disease of tea in Asia. It produces pale green, translucent circular spots on young leaves that develop into blisters — pale white on the underside with a pink to reddish color on top. Affected young shoots are curled and distorted. The disease progresses rapidly in cool, wet, and misty conditions (high elevations, monsoon season). It reduces both yield (infected shoots are not plucked) and tea quality significantly. Organic management is extremely difficult; copper-based fungicides provide partial control. Chemical control relies on copper oxychloride, hexaconazole, or propiconazole fungicides applied on a 5–7 day schedule during high-risk periods. Prevention includes planting resistant tea clones and using overhead shade to reduce humidity."
    },
    {
        "disease": "Tea Red Rust (Algal Leaf Spot)",
        "content": "Tea Red Rust or Algal Leaf Spot is caused not by a fungus but by the parasitic green alga Cephaleuros parasiticus. It produces circular, orange-red, velvety, powdery spots on mature leaves that have a rust-like appearance. It weakens plants by reducing photosynthesis but is rarely fatal. Organic management includes improving airflow through pruning, controlling shade, and maintaining plant vigor. Copper fungicides (copper oxychloride) applied during sporulation periods effectively control the alga. Prevention involves maintaining appropriate shade levels, avoiding overly shaded conditions that promote algal growth, and ensuring adequate plant nutrition, as stressed plants are more susceptible."
    },

    # ══════════════════════════════════════════
    # PAPAYA
    # ══════════════════════════════════════════
    {
        "disease": "Papaya Ringspot Virus (PRSV)",
        "content": "Papaya Ringspot Virus (PRSV) is the most devastating disease of papaya globally, transmitted non-persistently by multiple aphid species. Symptoms include mosaic and distortion of leaves, water-soaked streaks on petioles and stems (ringspot), and characteristic ring patterns on fruit surface with oily spots. Infected plants produce distorted, unmarketable fruit and eventually decline. There is no chemical cure. The most successful management strategy was the development of transgenic virus-resistant papaya (Rainbow and SunUp varieties in Hawaii, which saved the Hawaiian papaya industry). In non-GMO systems, management relies on aggressive roguing of infected plants, controlling aphid vectors with Neem Oil or mineral oil sprays to reduce transmission, and establishing new plantations as far as possible from existing infected sites. Cross-protection using mild virus strains has shown some success."
    },
    {
        "disease": "Papaya Anthracnose",
        "content": "Papaya Anthracnose (Colletotrichum gloeosporioides) is primarily a postharvest disease, though preharvest infections occur as quiescent latent infections that activate after harvest. Symptoms on ripe fruit appear as water-soaked, sunken, dark brown lesions that rapidly coalesce and can destroy the entire fruit surface, often with salmon-pink spore masses in the center. It is a major constraint to papaya export. Organic management includes hot water treatment of fruit (48°C for 20 minutes) immediately after harvest. Chemical preharvest control involves prochloraz, thiabendazole, or azoxystrobin applied to fruit in the field. Postharvest treatment uses fungicidal dips combined with controlled atmosphere or modified atmosphere storage. Prevention involves careful harvesting to avoid wounds and immediate postharvest handling."
    },

    # ══════════════════════════════════════════
    # AVOCADO
    # ══════════════════════════════════════════
    {
        "disease": "Avocado Root Rot (Phytophthora cinnamomi)",
        "content": "Avocado Root Rot, caused by Phytophthora cinnamomi, is the most destructive disease of avocado worldwide. The pathogen kills feeder roots, causing water and nutrient stress. Above-ground symptoms include pale green to yellow foliage, small leaves, sparse canopy, wilting despite moist soil, and dark, water-soaked feeder roots with no white tips. Trees decline slowly over years and eventually die. The pathogen spreads in water movement (runoff, flooding) and through infested soil on equipment. Organic management includes mounding soil around trunks to improve drainage, mulching to promote biological suppression, and applying phosphonate (phosphorous acid, a non-pesticide elicitor of plant defenses). Chemical management uses phosphonate injections or foliar sprays — the most effective treatment available. Prevention requires excellent drainage, planting on raised beds in heavy soils, avoiding movement of infested soil, and using rootstocks with demonstrated tolerance (e.g., Dusa, Latas)."
    },
    {
        "disease": "Avocado Sunblotch",
        "content": "Avocado Sunblotch Disease is caused by Avocado sunblotch viroid (ASBVd), a circular RNA molecule that is the smallest known plant pathogen. Symptoms include yellow or white streaks on fruit skin (the 'sunblotch' pattern), pale yellow streaking on leaves, red or yellow streaking on stems, and stunted growth. Infected trees are significantly reduced in yield (up to 40%) even when symptoms are mild or absent. The viroid is transmitted through infected seed (very high rate), through grafting, and through contaminated pruning tools. There is no cure. Prevention is the only management strategy: using certified viroid-indexed planting material (tested by RT-PCR), sterilizing all pruning tools between cuts with 10% bleach or 70% alcohol, and never propagating from infected trees or using seed from unknown sources."
    },

    # ══════════════════════════════════════════
    # COCONUT / PALM
    # ══════════════════════════════════════════
    {
        "disease": "Coconut Lethal Yellowing",
        "content": "Coconut Lethal Yellowing (CLY) is caused by a phytoplasma (Candidatus Phytoplasma palmae) transmitted by the planthopper Myndus crudus. Symptoms progress in sequence: premature fruit drop (all sizes), blackening and death of inflorescences, yellowing of leaves from the lower fronds upward, and death of the growing spear — total plant death typically occurs within 3–6 months of first symptoms. It devastates susceptible tall varieties (including Jamaica Tall) but Malayan Dwarf and its hybrids (Maypan) are highly tolerant. There is no cure for infected trees. Organic management has limited options; the primary prevention is planting tolerant varieties. Chemical intervention using tetracycline antibiotic trunk injection (oxytetracycline HCl) can suppress symptoms and prolong the life of high-value infected trees but does not cure them."
    },
    {
        "disease": "Oil Palm Ganoderma Basal Stem Rot",
        "content": "Ganoderma Basal Stem Rot (Ganoderma boninense) is the most serious disease of oil palm in Southeast Asia, causing annual losses exceeding $500 million in Malaysia and Indonesia alone. The pathogen colonizes old root systems and spreads through root-to-root contact, causing white rot of basal stem tissues. Above-ground symptoms include yellowing, withering of lower fronds, crown flattening, and ultimately death. Fruiting bodies (conks) of the bracket fungus appear at the base. There is no curative treatment. Organic and integrated management focuses on meticulous removal of all infected roots and stem material during replanting (reducing inoculum), biological control with Trichoderma harzianum applications, and trunk injection or soil application of hexaconazole for partial suppression. Prevention involves using planting material selected for tolerance and thorough sanitation during replanting."
    },

    # ══════════════════════════════════════════
    # SUNFLOWER
    # ══════════════════════════════════════════
    {
        "disease": "Sunflower Downy Mildew",
        "content": "Sunflower Downy Mildew (Plasmopara halstedii) is a systemic disease spread through soilborne oospores and infected seed. Systemically infected plants are severely stunted, with a white downy growth on the underside of leaves, chlorotic (yellow-green) upper leaf surfaces, and sometimes leaf distortion. Plants may be completely sterile. The pathogen has multiple races, and resistance in varieties is race-specific. Organic management includes long rotations (5+ years) away from sunflower, using disease-free seed, and avoiding waterlogged soils. Chemical control uses metalaxyl or mefenoxam seed treatments, which are highly effective. Prevention requires using seed treated with metalaxyl and planting race-specific resistant varieties matched to local race populations."
    },
    {
        "disease": "Sunflower Sclerotinia Head Rot",
        "content": "Sunflower Head Rot (Sclerotinia sclerotiorum) causes a cottony white mycelial growth on the back of the sunflower head (capitulum), leading to a soft, watery rot of the receptacle tissue and ultimately head drop. Seeds are destroyed or severely shriveled. Hard, black sclerotia form inside infected heads and stems. The fungus has a very wide host range (400+ species) and persists in soil as sclerotia for 5+ years. Organic management includes crop rotation (minimum 3 years away from other susceptible hosts including canola, beans, and carrots), and removing infected heads promptly. Chemical control uses foliar fungicide applications (boscalid, fluopyram) at early flowering. Prevention relies on selecting tolerant varieties and avoiding fields with heavy Sclerotinia history."
    },

    # ══════════════════════════════════════════
    # BARLEY
    # ══════════════════════════════════════════
    {
        "disease": "Barley Net Blotch",
        "content": "Barley Net Blotch is caused by two forms of Pyrenophora teres: the net form (P. teres f. teres, NFNB) and the spot form (P. teres f. maculata, SFNB). Net form produces distinctive net-like, brown reticulate patterns on leaves; spot form produces oval to circular dark brown spots. Both cause premature leaf senescence and significant yield losses (up to 40%) in susceptible varieties under humid conditions. Organic management includes crop rotation and using disease-free seed. Chemical control involves triazole seed treatments (triadimefon, tebuconazole) and foliar applications of strobilurin or triazole fungicides at flag leaf stage. Prevention focuses on selecting resistant varieties and avoiding barley-on-barley rotations."
    },
    {
        "disease": "Barley Powdery Mildew",
        "content": "Barley Powdery Mildew (Blumeria graminis f. sp. hordei) is a major disease of barley in cool, temperate regions. It produces a white, powdery mycelium and conidia on leaf surfaces, sheaths, and awns. Infection reduces photosynthesis and causes premature leaf death. It is favored by moderate temperatures (15–22°C) and low to moderate humidity. Organic management relies on planting resistant varieties. Chemical control uses DMI fungicides (triadimenol, propiconazole) or morpholine fungicides (fenpropimorph) applied at first sign of disease or preventively. Prevention involves avoiding high nitrogen applications that produce lush, highly susceptible tissue, and using resistance gene stacking in varieties."
    },
    {
        "disease": "Barley Covered Smut",
        "content": "Barley Covered Smut (Ustilago hordei) replaces the entire grain content of infected plants with a mass of black teliospores, though the smutted grain remains enclosed in the glumes (unlike loose smut). The spores are dispersed at harvest and contaminate healthy seed. Infection occurs at germination, with the pathogen growing systemically within the plant. Organic management requires hot water seed treatment (52°C for 10 minutes followed by cold water). Chemical control with triazole or carboxin seed treatments provides very high levels of control. Prevention involves using certified, treated seed and roguing any escaped smutted plants before harvest."
    },
    {
        "disease": "Barley Healthy",
        "content": "Healthy barley (Hordeum vulgare) plants display uniform, bright to medium green foliage with erect tillers and no spots, pustules, or powdery coatings. Flag leaves are broad and fully expanded. Grain heads (ears) fill completely with plump, well-developed kernels. Maintaining barley health requires selecting varieties with strong resistance packages for local disease pressures, using treated seed, maintaining soil pH at 6.0–7.0, avoiding waterlogged soils that favor root rots, and scouting regularly from tillering through flag leaf emergence for net blotch, powdery mildew, and aphid-transmitted Barley Yellow Dwarf Virus."
    },

    # ══════════════════════════════════════════
    # OILSEED RAPE / CANOLA
    # ══════════════════════════════════════════
    {
        "disease": "Canola Sclerotinia Stem Rot",
        "content": "Sclerotinia Stem Rot of canola (Sclerotinia sclerotiorum) is the most economically important disease of canola in Canada, Australia, and Europe. The pathogen infects through senescing flower petals that fall and lodge in the canopy. Infected stems develop bleached, straw-colored lesions, and white fluffy mycelium grows inside hollow stems along with hard, black, irregular sclerotia. Infected stems collapse and the crop lodges. Losses of 5–20% (sometimes higher) are common in susceptible years. Organic management includes long rotations (3–5 years away from all susceptible hosts). Chemical control uses fungicides (boscalid, fluopyram, iprodione, or thiophanate-methyl) applied at 20–30% flower open (early to mid-bloom). Prevention involves selecting varieties with improved tolerance ratings and avoiding dense canopies through appropriate seeding rates."
    },
    {
        "disease": "Canola Blackleg",
        "content": "Canola Blackleg (Leptosphaeria maculans) causes dark cankers at the base of stems (crown cankers) that girdle the stem and cause premature plant death (lodging or 'blackleg'). On leaves, it produces pale gray lesions with dark pepper-spot pycnidia. On pods, small black spots develop. The pathogen persists on stubble and releases ascospores during rain events that coincide with the early crop stage. Seedborne infection from contaminated seed is also critical. Organic management includes crop rotation (minimum 3 years), deep burial of stubble by tillage, and using resistant varieties. Chemical control requires a triazole seed treatment (fluquinconazole, prothioconazole) and possibly a foliar application at the 3–6 leaf stage in high-risk situations. Prevention relies on resistant variety selection matched to local pathotype composition."
    },

    # ══════════════════════════════════════════
    # SPINACH
    # ══════════════════════════════════════════
    {
        "disease": "Spinach Downy Mildew",
        "content": "Spinach Downy Mildew (Peronospora farinosa f. sp. spinaciae) is the most devastating disease of spinach globally. It produces pale yellow to green lesions on the upper leaf surface with a purple-gray downy sporulation on the underside. The pathogen has numerous physiological races, and new races regularly overcome resistance in commercial varieties. It spreads rapidly under cool, humid conditions and causes complete crop loss in severe cases. Organic management focuses on airflow improvement through proper plant spacing, avoiding overhead irrigation, and copper fungicides. Chemical control uses mancozeb, fosetyl-Al, or mandipropamid fungicides applied preventatively. Prevention requires planting the latest race-specific resistant varieties and using drip irrigation."
    },

    # ══════════════════════════════════════════
    # GENERAL ABIOTIC CONDITIONS
    # ══════════════════════════════════════════
    {
        "disease": "Nutrient Deficiency - Nitrogen",
        "content": "Nitrogen deficiency is the most common nutrient disorder of crop plants globally. Symptoms begin as uniform yellowing (chlorosis) of older (lower) leaves first, progressing upward as the plant remobilizes nitrogen from older tissue to support new growth. Severely deficient plants are stunted, pale yellow-green overall, and produce reduced yields. Nitrogen deficiency is distinguished from magnesium deficiency (interveinal chlorosis, older leaves) and sulfur deficiency (younger leaves affected first). Correction involves applying readily available nitrogen sources: urea, ammonium nitrate, or liquid nitrogen fertilizers. Organic sources include compost, blood meal, feather meal, and fish emulsion. Prevention requires soil testing before planting, split nitrogen applications to match plant demand and reduce leaching, and incorporation of legume cover crops to build soil nitrogen."
    },
    {
        "disease": "Nutrient Deficiency - Iron Chlorosis",
        "content": "Iron chlorosis produces a distinctive interveinal chlorosis (yellowing between green veins) on young, new growth first — the opposite pattern to nitrogen deficiency. It is most commonly caused not by lack of iron in soil but by high soil pH (above 7.0–7.5) that renders iron unavailable. It is particularly severe in fruit trees, blueberries, soybeans, and sorghum on calcareous or overlimed soils. Correction involves foliar sprays of iron chelate (FeEDTA, FeEDDHA) for rapid response, and soil applications of acidifying fertilizers (ammonium sulfate, elemental sulfur) to lower pH long-term. In fruit trees, trunk injection of ferric ammonium citrate or iron chelate provides rapid correction. Prevention requires maintaining appropriate soil pH for the crop and selecting iron-efficient varieties where available."
    },
    {
        "disease": "Abiotic Stress - Blossom End Rot",
        "content": "Blossom End Rot (BER) is a physiological disorder of tomatoes, peppers, watermelons, and cucumbers caused by localized calcium deficiency at the blossom end of developing fruit. It appears as a water-soaked area at the blossom end (opposite the stem) that turns dark brown to black and leathery as it dries. The root cause is usually not calcium deficiency in soil but rather irregular or insufficient water supply that disrupts calcium uptake and translocation, or excessive ammonium nitrogen fertilization. Correction involves applying calcium-containing foliar sprays (calcium chloride, calcium nitrate) directly to developing fruit. Prevention requires maintaining consistent soil moisture through drip irrigation or mulching, ensuring adequate soil calcium through lime or gypsum, and avoiding excessive ammonium or potassium fertilization."
    },
    {
        "disease": "Abiotic Stress - Sunscald",
        "content": "Sunscald is a physiological disorder affecting fruit (particularly tomatoes, peppers, and apples) and bark (especially thin-barked young trees) exposed to intense direct sunlight. On fruit, it appears as whitish-gray to tan, papery, sometimes depressed areas on the side of the fruit facing the sun. In trees, it occurs as southwest-facing bark injury on young trunks (sunscald or 'southwest disease') after cold winters when bark temperature fluctuates dramatically. It is not caused by any pathogen, though sunscalded areas are frequently colonized by secondary rot organisms. Management of fruit sunscald involves maintaining adequate leaf cover through proper plant nutrition and disease management. Tree trunk sunscald is prevented by wrapping young trunks with light-colored tree wrap in late fall and removing it in spring."
    },

    # ══════════════════════════════════════════
    # ADDITIONAL PLANTVILLAGE CLASSES
    # ══════════════════════════════════════════
    {
        "disease": "Tomato Powdery Mildew",
        "content": "Tomato Powdery Mildew is caused by Leveillula taurica (internal growth habit, infects through stomata) and Oidium neolycopersici (surface growth habit). L. taurica initially appears as pale yellow blotches on the upper leaf surface with a faint white powdery growth on the underside, making it easily confused with downy mildew or nutritional deficiency. O. neolycopersici produces typical white powdery growth on the upper surface. Both cause premature defoliation in severe infections. Organic control includes potassium bicarbonate, wettable sulfur, and Neem Oil. Chemical control uses DMI fungicides (myclobutanil, difenoconazole) or QoI fungicides (azoxystrobin), with resistance management essential. Prevention involves selecting resistant varieties and optimizing ventilation in greenhouse production."
    },
    {
        "disease": "Potato Virus Y (PVY)",
        "content": "Potato Virus Y (PVY) is the most economically significant virus affecting potatoes globally, transmitted non-persistently by numerous aphid species. Multiple strains exist, including necrotic strains (PVYN, PVYNTN) that cause potato tuber necrotic ringspot disease (PTNRD) — internal brown, necrotic rings in tubers that make them unmarketable. Leaf symptoms range from mild mosaic to severe necrotic streaking and death of foliage depending on the strain and potato variety. There is no chemical cure. Management requires using certified PVY-free seed potatoes, controlling aphid vectors with systemic insecticides, mineral oil sprays to reduce transmission efficiency, and roguing infected plants early. Prevention involves planting certified seed annually, not saving seed from suspected infected crops, and selecting PVY-resistant varieties."
    },
    {
        "disease": "Sweet Pepper Phytophthora Blight",
        "content": "Phytophthora Blight of pepper (Phytophthora capsici) is the most destructive disease of bell and chili peppers in humid regions. It causes a rapid, dark, water-soaked crown rot at the soil line leading to complete vine collapse within days (rapid wilt). It also causes foliar blight (water-soaked lesions progressing to brown collapse), and fruit rot (light brown, water-soaked, often with white sporulation). The pathogen also affects cucurbits, tomatoes, eggplant, and pumpkin. Organic management includes raised beds, excellent drainage, and copper fungicide applications. Chemical control uses metalaxyl-M, dimethomorph, or cyazofamid fungicides applied preventatively as soil drenches and foliar sprays. Prevention requires excellent drainage, drip irrigation, crop rotation of 3+ years, and avoiding overwatering or flooding."
    },
    {
        "disease": "Eggplant Verticillium Wilt",
        "content": "Eggplant (Solanum melongena) is highly susceptible to Verticillium dahliae, more so than tomato or pepper. Symptoms include interveinal yellowing of lower leaves (often one-sided), browning and death of affected leaves, and internal vascular discoloration (tan-brown) of the stem. The disease progresses more rapidly in warm soil and can kill plants outright. There is no curative treatment. Organic management includes soil solarization (highly effective in warm climates), grafting onto Verticillium-tolerant rootstocks, and Trichoderma spp. soil inoculants. Chemical fumigation with metam sodium reduces inoculum. Prevention involves long rotations (5+ years), avoiding fields with known Verticillium history, and grafting susceptible varieties onto resistant rootstocks (currently the most practical solution in commercial production)."
    },
    {
        "disease": "Corn Smut (Common Smut)",
        "content": "Corn Common Smut (Ustilago maydis) produces large, irregularly shaped, silvery-white to gray galls (tumor-like growths) on ears, tassels, stalks, and leaves. Galls begin silver-gray, then rupture to release masses of olive-black powdery spores. While severe infections reduce yield, smut galls are actually a culinary delicacy (huitlacoche or corn truffle) in Mexican cuisine, commanding premium prices. Organic management for disease suppression focuses on crop rotation and burying or composting infected plant material before spores are released. There are no effective chemical treatments after infection. Prevention involves selecting smut-tolerant hybrid varieties, avoiding mechanical wounding (insect damage, hail, cultivation injuries), and maintaining adequate soil moisture and nutrition."
    },
    {
        "disease": "Bean Angular Leaf Spot",
        "content": "Angular Leaf Spot of common bean (Phaeoisariopsis griseola) causes angular, dark brown lesions limited by leaf veins on leaves, pods, and stems. Pod lesions are elongated, dark brown, and may cause pod distortion and seed discoloration. It is a major disease in tropical and subtropical bean production areas. Organic management includes crop rotation (2 years), using disease-free seed, and copper-based fungicides. Chemical control relies on triazole fungicides (azoxystrobin, difenoconazole) applied at early pod formation. Prevention focuses on planting resistant varieties (many are available through CIAT breeding programs) and using drip irrigation to minimize leaf wetness."
    },
    {
        "disease": "Bean Rust",
        "content": "Bean Rust (Uromyces appendiculatus) is one of the most widespread diseases of common bean (Phaseolus vulgaris). It produces reddish-brown, powdery urediniospore pustules primarily on the underside of leaves, with corresponding yellow spots on the upper surface. Severe infections cause defoliation and pod damage. The pathogen has hundreds of races, making variety resistance complex. Organic management includes sulfur-based fungicides and crop rotation. Chemical control uses triazole fungicides (tebuconazole, propiconazole) applied at first detection. Prevention involves planting early-maturing varieties to escape peak rust pressure, using resistant varieties where available, and avoiding dense planting populations that maintain canopy humidity."
    },

])

def seed_database():
    print("Initializing Pinecone Seeder...")
    from langchain_core.documents import Document
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_pinecone import PineconeVectorStore
    
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME", "agroaid-db")
    
    if not pinecone_api_key:
        print("Error: Missing PINECONE_API_KEY in .env")
        return
        
    documents = []
    text_content = ""
    for item in plant_data:
        doc = Document(page_content=item["content"], metadata={"disease": item["disease"], "source": "verified_ag_web_data"})
        documents.append(doc)
        text_content += f"{item['content']}\n\n"
        
    print(f"Prepared {len(documents)} core agricultural documents.")
    
    try:
        print(f"Connecting to Pinecone index: {index_name}...")
        PineconeVectorStore.from_documents(documents, embeddings, index_name=index_name)
        print("Successfully uploaded seed data to Pinecone!")
    except Exception as e:
        print(f"Pinecone upload failed: {e}")
        
    # Also save to local FAISS just in case
    try:
        DB_DIR = r"c:\Users\krish\OneDrive\Desktop\New folder\AgroAid_AI_Pro\faiss_index"
        from langchain_community.vectorstores import FAISS
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        docs = text_splitter.split_documents(documents)
        
        vectorstore = FAISS.from_documents(docs, embeddings)
        os.makedirs(DB_DIR, exist_ok=True)
        vectorstore.save_local(DB_DIR)
        print(f"Successfully saved FAISS index to {DB_DIR}")
    except Exception as e:
        print(f"FAISS sync failed: {e}")

if __name__ == "__main__":
    seed_database()
