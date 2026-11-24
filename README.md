# Rifen sortzailea — frontend hutsa

Webgune estatikoa da: HTML + CSS + JavaScript. Flask edo backendik ez du behar. PDFa erabiltzailearen nabigatzailean sortzen da jsPDF liburutegiarekin.

## Fitxategiak

- `index.html`: euskarazko formularioa.
- `style.css`: diseinua.
- `script.js`: kalkuluak eta PDF sortzea.
- `img/aurrealdea.png`: igo duzun lehen irudia.
- `img/atzealdea.png`: igo duzun bigarren irudia.

## GitHub Pages-en argitaratzea

1. Sortu GitHub-en repository bat, adibidez `rifen-sortzailea`.
2. Igo karpeta honetako fitxategi guztiak repositoryaren erro nagusira, `img` karpeta barne.
3. Joan **Settings → Pages** atalera.
4. **Build and deployment → Deploy from a branch** aukeratu.
5. Branch: `main`; folder: `/ (root)`; sakatu **Save**.
6. GitHub Pages-ek emandako helbidean webgunea erabilgarri egongo da.

PDFa sortzeko jsPDF CDN bidez kargatzen da; beraz, erabiltzaileak Interneteko konexioa behar du.

## Inprimatze-sistema

A4 bertikalean, 2 zutabe × 5 errenkada (10 rifa orriko). Aurrealdeko orri bakoitzaren ondoren atzealdeko orria gehitzen da. Zenbakiak jatorrizko Python kodeko formularekin antolatzen dira: `current_number + offset + row * 20 + col * 10`, 10 orriko loteetan.

## Diseinuaren doikuntza garrantzitsua

Erabilitako irudiak 1240 × 877 px dira. A4 orri bertikala 2 × 5 laukitan banatzean, lauki bakoitzaren proportzioa ez da irudien proportzio bera; kodeak irudia laukira luzatzen du, txartel guztiak orrian ertzetik ertzera sartzeko.

Irudietan jada agertzen ziren datu zaharrak estali eta berriak idazten dira:
- Aurrealdea: prezioa eta beheko eskuineko zenbakia.
- Atzealdea: ikasturtea.

Lehenik proba-PDF bat sortu eta inprimatu, eta egiaztatu inprimagailuaren duplex aukerak atzealdeak behar bezala lerrokatzen dituela. Bi aldeetako inprimaketan orientazio/iraulketa ezarpena inprimagailuaren arabera aldatu daiteke.

## Garrantzitsua

Jatorrizko Python kodeak 100 zenbakiko multzoak 10 aurrealde-orritan banatzen ditu. Hori mantendu da. Ondorioz, 1–50 zenbakiak eskatuz gero, 10 aurrealde-orri sortuko dira, bakoitzean 5 rifa eta 5 hutsune egongo direlarik. Horrek jatorrizko zenbaki-antolaketa mantentzen du.
