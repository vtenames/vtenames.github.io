var log = console.log;

// Ref: https://gist.github.com/bluzky/b8c205c98ff3318907b30c3e0da4bf3f
function remove_tonals(str,opt="en") {
    // English (26 chars)
	if (opt =="en"){
		from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
        to   = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
	}
    // Vietnamese (29 chars)
    else{
		from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
		to   = "aaaaaăăăăăăââââââeeeeeêêêêêêđuuuuuưưưưưưoooooôôôôôôơơơơơơiiiiiaeiiouuncyyyyy";
	}
  
    // remove accents
    for (var i=0, l=from.length ; i < l ; i++) {
        str = str.replace(RegExp(from[i], "gi"), to[i]);
    }
    str = str.toLowerCase().trim();
    return str;
}

function d$(Sel){
    return document.querySelector(Sel);
}

function set_namesbysound(Arr){
    d$("#Sounds").innerHTML = Arr.join(", ");
}

function set_out(V){
    d$("#Output").innerHTML = V;
}

// A, Ă, Â B C D, Đ E, Ê G H I K L M N O, Ô, Ơ
// P Q R S T U, Ư V X Y    
// Conversions:
var Conv = {
    "a":["a","ah","ar"], "ă":["a","ah","ak"], 
    "â":["a","er"], "b":["b"], "c":["c","k"], 
    "d":["j","z"], "đ":["d"], "e":["e","er"], 
    "ê":["e","eh"], "g":["g","gh"], "h":["h"], 
    "i":["i","ee","y"], "k":["k","c"], "l":["l","n"], 
    "m":["m"], "n":["n","l"], "o":["o","or","oh"], 
    "ô":["o","oh"], "ơ":["o","er","a"], "p":["p","ph"], 
    "q":["q","w"], "r":["r"], "s":["s","sh"], 
    "t":["t","th"], "u":["u","oo"], "ư":["u","uh"], 
    "v":["v"], "x":["x","s","sh"], "y":["y","i","ee"]
};

function make_namesbysound(List,Chars,idx,Cur){
    for (let Opt of Conv[Chars[idx]]){
        let Orig = Cur;
        Cur += Opt;
      
        if (idx==Chars.length-1)
            List.push(Cur);
        else
            make_namesbysound(List,Chars,idx+1,Cur);
      
        Cur = Orig;
    }
}

function score(Namebysound,Name){
    var n = Namebysound.length;
    if (Name.length<n) n=Name.length;
    var points = 0;
  
    if (Namebysound[0]!=Name[0])
        return -1;
  
    for (let i=0; i<n; i++)
        if (Namebysound[i]==Name[i])
            points++;
  
    return points;
}

function find_matchings(Namesbysound,Allnames){
    var Pairs = [];
  
    for (let Namebysound of Namesbysound)
        for (let Name of Allnames){
            Pairs.push({
                Namebysound, Name,
                points: score(Namebysound,Name)
            });            
        }
  
    // Sort reverse
    Pairs.sort((A,B)=>{
        return B.points-A.points;
    });    
    var Kepts = Pairs.slice(0,100);
  
    return Kepts.map(X=>X.Namebysound+"->"+X.Name);
}

function first_up(Str){
    return Str[0].toUpperCase()+Str.slice(1);
}

function show_names(Names){
    // Get names by sound
    var Keys = [];
    
    for (let Name of Names){
        Keys.push(Name.split("->")[0]);
    }
    Keys = [...new Set(Keys)];
    Keys.sort();
  
    // Name list
    var Namemap = {};
  
    for (let Name of Names){
        let Key = Name.split("->")[0];
        let Enname = first_up(Name.split("->")[1]);
        
        if (Namemap[Key]==null) Namemap[Key]=[];
        Namemap[Key].push(Enname);
    }
    for (let K of Keys)
        Namemap[K].sort();
  
    // Show to UI
    var Html = "";
  
    for (let K in Namemap){
        Namemap[K] = Namemap[K].map(X=>`<b>${X}</b>`);
      
        Html += 
        `<div>${K} -></div>
        <div>${Namemap[K].join(", ")}</div>
        <div>&nbsp;</div>`;
    }  
    set_out(Html);
}

function suggest(){
    var Inp = d$("#Input").value.trim().toLowerCase();
    var Gen = d$("#Gender").value;
    Inp     = remove_tonals(Inp,"vn"); // Vn alphabet
 
    if (Inp.length==0){
        set_out("Please type in input box");
        return;
    }
    
    // Get all possible sounds
    var Namesbysound = [];
    var Chars        = Inp.split("");
    make_namesbysound(Namesbysound,Chars,idx=0,Cur="");
    Namesbysound.sort();
    set_namesbysound(Namesbysound);
  
    // Find matching English names
    if (Gen=="male"){ 
        log("Male");
        var Allnames=Males;
    }
    else{
        log("Female");
        var Allnames=Females;
    }
  
    var Names = find_matchings(Namesbysound,Allnames);     
    show_names(Names);
}

// Data
// Ref: https://www.ssa.gov/cgi-bin/popularnames.cgi
window.En_Names = [
    ["1","Liam","Olivia"], ["2","Noah","Emma"], ["3","Oliver","Charlotte"], ["4","James","Amelia"], 
    ["5","Elijah","Sophia"], ["6","Mateo","Mia"], ["7","Theodore","Isabella"], ["8","Henry","Ava"], ["9","Lucas","Evelyn"], 
    ["10","William","Luna"], ["11","Benjamin","Harper"], ["12","Levi","Sofia"], ["13","Sebastian","Camila"], ["14","Jack","Eleanor"],
    ["15","Ezra","Elizabeth"], ["16","Michael","Violet"], ["17","Daniel","Scarlett"], ["18","Leo","Emily"], ["19","Owen","Hazel"],
    ["20","Samuel","Lily"], ["21","Hudson","Gianna"], ["22","Alexander","Aurora"], ["23","Asher","Penelope"],
    ["24","Luca","Aria"], ["25","Ethan","Nora"], ["26","John","Chloe"], ["27","David","Ellie"], ["28","Jackson","Mila"], 
    ["29","Joseph","Avery"], ["30","Mason","Layla"], ["31","Luke","Abigail"], ["32","Matthew","Ella"], ["33","Julian","Isla"],
    ["34","Dylan","Eliana"], ["35","Elias","Nova"], ["36","Jacob","Madison"], ["37","Maverick","Zoe"], ["38","Gabriel","Ivy"],
    ["39","Logan","Grace"], ["40","Aiden","Lucy"], ["41","Thomas","Willow"], ["42","Isaac","Emilia"], ["43","Miles","Riley"],
    ["44","Grayson","Naomi"], ["45","Santiago","Victoria"], ["46","Anthony","Stella"], ["47","Wyatt","Elena"], 
    ["48","Carter","Hannah"], ["49","Jayden","Valentina"], ["50","Ezekiel","Maya"], ["51","Caleb","Zoey"], ["52","Cooper","Delilah"], 
    ["53","Josiah","Leah"], ["54","Charles","Lainey"], ["55","Christopher","Lillian"], ["56","Isaiah","Paisley"], ["57","Nolan","Genesis"],
    ["58","Cameron","Madelyn"], ["59","Nathan","Sadie"], ["60","Joshua","Sophie"], ["61","Kai","Leilani"], ["62","Waylon","Addison"], 
    ["63","Angel","Natalie"], ["64","Lincoln","Josephine"], ["65","Andrew","Alice"], ["66","Roman","Ruby"], ["67","Adrian","Claire"],
    ["68","Aaron","Kinsley"], ["69","Wesley","Everly"], ["70","Ian","Emery"], ["71","Thiago","Adeline"], ["72","Axel","Kennedy"], 
    ["73","Brooks","Maeve"], ["74","Bennett","Audrey"], ["75","Weston","Autumn"], ["76","Rowan","Athena"], ["77","Christian","Eden"],
    ["78","Theo","Iris"], ["79","Beau","Anna"], ["80","Eli","Eloise"], ["81","Silas","Jade"], ["82","Jonathan","Maria"], ["83","Ryan","Caroline"],
    ["84","Leonardo","Brooklyn"], ["85","Walker","Quinn"], ["86","Jaxon","Aaliyah"], ["87","Micah","Vivian"], ["88","Everett","Liliana"],
    ["89","Robert","Gabriella"], ["90","Enzo","Hailey"], ["91","Parker","Sarah"], ["92","Jeremiah","Savannah"], ["93","Jose","Cora"],
    ["94","Colton","Madeline"], ["95","Luka","Natalia"], ["96","Easton","Ariana"], ["97","Landon","Lydia"], ["98","Jordan","Lyla"],
    ["99","Amir","Clara"], ["100","Gael","Allison"], ["101","Austin","Aubrey"], ["102","Adam","Millie"], ["103","Jameson","Melody"],
    ["104","August","Ayla"], ["105","Xavier","Serenity"], ["106","Myles","Bella"], ["107","Dominic","Skylar"], ["108","Damian","Josie"],
    ["109","Nicholas","Lucia"], ["110","Jace","Daisy"], ["111","Carson","Raelynn"], ["112","Atlas","Eva"], ["113","Adriel","Juniper"],
    ["114","Kayden","Samantha"], ["115","Hunter","Elliana"], ["116","River","Eliza"], ["117","Greyson","Rylee"], ["118","Emmett","Nevaeh"],
    ["119","Harrison","Hadley"], ["120","Vincent","Alaia"], ["121","Milo","Parker"], ["122","Jasper","Julia"], ["123","Giovanni","Amara"],
    ["124","Jonah","Rose"], ["125","Zion","Charlie"], ["126","Connor","Ashley"], ["127","Sawyer","Remi"], ["128","Arthur","Georgia"],
    ["129","Ryder","Adalynn"], ["130","Archer","Melanie"], ["131","Lorenzo","Amira"], ["132","Declan","Margaret"], ["133","Emiliano","Piper"],
    ["134","Luis","Brielle"], ["135","Diego","Mary"], ["136","George","Freya"], ["137","Evan","Cecilia"], ["138","Jaxson","Esther"],
    ["139","Carlos","Arya"], ["140","Graham","Sienna"], ["141","Juan","Summer"], ["142","Kingston","Peyton"], ["143","Nathaniel","Sage"],
    ["144","Matteo","Valerie"], ["145","Legend","Magnolia"], ["146","Malachi","Emersyn"], ["147","Jason","Catalina"], ["148","Leon","Margot"], 
    ["149","Dawson","Everleigh"], ["150","Bryson","Alina"], ["151","Amari","Sloane"], ["152","Calvin","Brianna"],   ["153","Ivan","Oakley"], 
    ["154","Chase","Valeria"], ["155","Cole","Blakely"], ["156","Ashton","Kehlani"], ["157","Ace","Oaklynn"], ["158","Arlo","Ximena"],
    ["159","Dean","Isabelle"], ["160","Brayden","Juliette"], ["161","Jude","Emerson"], ["162","Hayden","Amaya"], ["163","Max","Elsie"],
    ["164","Matias","Isabel"], ["165","Rhett","Mackenzie"], ["166","Jayce","Genevieve"], ["167","Elliott","Anastasia"],   ["168","Alan","Reagan"],
    ["169","Braxton","Katherine"], ["170","Kaiden","Ember"], ["171","Zachary","June"], ["172","Jesus","Bailey"],   ["173","Emmanuel","Andrea"],
    ["174","Adonis","Reese"], ["175","Charlie","Wrenley"], ["176","Judah","Gemma"], ["177","Tyler","Ada"], ["178","Elliot","Alani"],
    ["179","Antonio","Callie"], ["180","Emilio","Kaylee"], ["181","Camden","Olive"], ["182","Stetson","Rosalie"],   ["183","Maxwell","Myla"],
    ["184","Ryker","Alana"], ["185","Justin","Ariella"], ["186","Kevin","Kaia"], ["187","Messiah","Ruth"], ["188","Finn","Arianna"],
    ["189","Bentley","Sara"], ["190","Ayden","Jasmine"], ["191","Zayden","Phoebe"], ["192","Felix","Adaline"], ["193","Nicolas","River"],
    ["194","Miguel","Hallie"], ["195","Maddox","Adalyn"], ["196","Beckett","Wren"], ["197","Tate","Presley"], ["198","Caden","Lilah"],
    ["199","Beckham","Alora"], ["200","Andres","Amy"], ["201","Alejandro","Norah"], ["202","Alex","Annie"], ["203","Jesse","Zuri"], 
    ["204","Brody","Alexandra"], ["205","Tucker","Sutton"], ["206","Jett","Noelle"], ["207","Barrett","Kylie"], ["208","Knox","Molly"],
    ["209","Hayes","Lia"], ["210","Peter","Journee"], ["211","Timothy","Leia"], ["212","Joel","Evangeline"], ["213","Edward","Lila"],
    ["214","Griffin","Aspen"], ["215","Xander","Saylor"], ["216","Oscar","Khloe"], ["217","Victor","Aitana"], ["218","Abraham","Alaina"],
    ["219","Brandon","Haven"], ["220","Abel","Aliyah"], ["221","Richard","Blake"], ["222","Callum","Kimberly"], ["223","Riley","Vera"],
    ["224","Patrick","Ana"], ["225","Karter","Kailani"], ["226","Malakai","Tatum"], ["227","Eric","Arabella"], ["228","Grant","Diana"], 
    ["229","Israel","Selena"], ["230","Milan","Kiara"], ["231","Gavin","Harmony"], ["232","Rafael","Lilith"], ["233","Tatum","Rowan"],
    ["234","Kairo","Delaney"], ["235","Elian","Vivienne"], ["236","Kyrie","Zara"], ["237","Louis","Collins"], ["238","Lukas","Harlow"], 
    ["239","Javier","Blair"], ["240","Nico","Leila"], ["241","Avery","Daphne"], ["242","Rory","Faith"], ["243","Aziel","Lennon"],
    ["244","Ismael","Stevie"], ["245","Jeremy","Mariana"], ["246","Zayn","Kaylani"], ["247","Cohen","Morgan"], ["248","Simon","Juliana"],
    ["249","Marcus","Gracie"], ["250","Steven","Nyla"], ["251","Mark","Miriam"], ["252","Dallas","Daniela"], ["253","Tristan","Dahlia"],
    ["254","Lane","Brynlee"], ["255","Blake","Rachel"], ["256","Paul","Angela"], ["257","Paxton","Lilly"], ["258","Bryce","Kamila"],
    ["259","Nash","Samara"], ["260","Crew","Ryleigh"], ["261","Kash","Taylor"], ["262","Kenneth","Dakota"], ["263","Omar","Lola"],
    ["264","Colt","Talia"], ["265","Lennox","Evie"], ["266","King","Jordyn"], ["267","Walter","Ophelia"], ["268","Emerson","Camille"],
    ["269","Phoenix","Gia"], ["270","Jaylen","Milani"], ["271","Derek","Lena"], ["272","Muhammad","Elaina"], ["273","Ellis","Malia"],
    ["274","Kaleb","Elise"], ["275","Preston","Celeste"], ["276","Jorge","Londyn"], ["277","Zane","Palmer"], ["278","Kayson","Mabel"], 
    ["279","Cade","Octavia"], ["280","Tobias","Sawyer"], ["281","Otto","Jane"], ["282","Kaden","Finley"], ["283","Remington","Marley"], 
    ["284","Atticus","Adelaide"], ["285","Finley","Lucille"], ["286","Holden","Shiloh"], ["287","Jax","Antonella"],   ["288","Cash","Ariel"],
    ["289","Martin","Poppy"], ["290","Ronan","Kali"], ["291","Maximiliano","Elianna"], ["292","Malcolm","Juliet"],   ["293","Romeo","Maisie"],
    ["294","Josue","Cataleya"], ["295","Francisco","Danna"], ["296","Bodhi","Aubree"], ["297","Cyrus","Gabriela"], ["298","Koa","Noa"],
    ["299","Angelo","Brooke"], ["300","Aidan","Celine"], ["301","Jensen","Alessia"], ["302","Erick","Hope"], ["303","Hendrix","Selah"], 
    ["304","Warren","Vanessa"], ["305","Bryan","Rory"], ["306","Cody","Sydney"], ["307","Leonel","Amari"], ["308","Onyx","Teagan"],
    ["309","Ali","Adriana"], ["310","Andre","Payton"], ["311","Jaziel","Rosemary"], ["312","Clayton","Laila"], ["313","Saint","London"], 
    ["314","Dante","Angelina"], ["315","Reid","Alayna"], ["316","Casey","Kendall"], ["317","Brian","Rebecca"], ["318","Gideon","Maggie"],
    ["319","Niko","Adelyn"], ["320","Maximus","Evelynn"], ["321","Colter","Thea"], ["322","Kyler","Amina"], ["323","Brady","Tessa"],
    ["324","Zyaire","Kayla"], ["325","Cristian","Esme"], ["326","Cayden","Mckenna"], ["327","Harvey","Nicole"], ["328","Cruz","Regina"], 
    ["329","Dakota","Luciana"], ["330","Damien","Julianna"], ["331","Manuel","Nayeli"], ["332","Anderson","Catherine"],   ["333","Cairo","Alyssa"],
    ["334","Colin","Journey"], ["335","Joaquin","Dream"], ["336","Ezequiel","Camilla"], ["337","Karson","Ariyah"],   ["338","Callan","Nina"],
    ["339","Briggs","Joanna"], ["340","Khalil","Mya"], ["341","Wade","Annabelle"], ["342","Jared","Esmeralda"],   ["343","Fernando","Lauren"],
    ["344","Ari","Fatima"], ["345","Colson","Giselle"], ["346","Kylian","Harley"], ["347","Archie","Jocelyn"], ["348","Banks","Phoenix"],
    ["349","Bowen","Trinity"], ["350","Kade","Malani"], ["351","Daxton","Heidi"], ["352","Jaden","Meadow"], ["353","Rhys","Raya"],
    ["354","Sonny","Paige"], ["355","Zander","Jayla"], ["356","Eduardo","Logan"], ["357","Iker","Leighton"], ["358","Sullivan","Charlee"],
    ["359","Bradley","Viviana"], ["360","Raymond","Madilyn"], ["361","Odin","Raven"], ["362","Spencer","Amora"],   ["363","Stephen","Navy"], 
    ["364","Prince","Itzel"], ["365","Brantley","Laura"], ["366","Killian","Emory"], ["367","Kamari","Azalea"], ["368","Cesar","Hayden"],
    ["369","Dariel","Aniyah"], ["370","Eithan","Winter"], ["371","Mathias","Aurelia"], ["372","Ricardo","Alivia"],   ["373","Orion","Brooklynn"],
    ["374","Titus","Francesca"], ["375","Luciano","Serena"], ["376","Rylan","Lilliana"], ["377","Pablo","Gracelynn"],   ["378","Chance","Kalani"],
    ["379","Travis","Aisha"], ["380","Kohen","Gwendolyn"], ["381","Marco","Elaine"], ["382","Jay","Nylah"], ["383","Malik","Hattie"],
    ["384","Hector","Wynter"], ["385","Edwin","Adelynn"], ["386","Armani","Adelina"], ["387","Bodie","Alessandra"],   ["388","Shiloh","Mylah"],
    ["389","Marshall","Alayah"], ["390","Remy","Anaya"], ["391","Russell","Julieta"], ["392","Baylor","Rosie"],   ["393","Kameron","Mariah"],
    ["394","Tyson","Demi"], ["395","Grady","Raelyn"], ["396","Oakley","Sabrina"], ["397","Baker","Helen"], ["398","Winston","Everlee"],
    ["399","Kane","Astrid"], ["400","Julius","Fiona"], ["401","Desmond","Michelle"], ["402","Royal","Xiomara"],   ["403","Sterling","Briella"], 
    ["404","Mario","Alexandria"], ["405","Kylo","Frances"], ["406","Sergio","Sunny"], ["407","Jake","Sarai"], ["408","Kashton","Alaya"],
    ["409","Shepherd","Melissa"], ["410","Franklin","Veronica"], ["411","Ibrahim","Mira"], ["412","Ares","Zariah"],   ["413","Koda","Brynn"],
    ["414","Lawson","Reign"], ["415","Hugo","Maryam"], ["416","Kyle","Lana"], ["417","Kyson","Arielle"], ["418","Kobe","Raegan"],
    ["419","Pedro","Remington"], ["420","Santino","Salem"], ["421","Wilder","Elisa"], ["422","Sage","Aylin"], ["423","Raiden","Emely"],
    ["424","Damon","Carolina"], ["425","Nasir","Sylvie"], ["426","Sean","Sylvia"], ["427","Forrest","Annalise"], ["428","Kian","Willa"],
    ["429","Reed","Mallory"], ["430","Tanner","Kira"], ["431","Jalen","Daniella"], ["432","Apollo","Elora"], ["433","Zayne","Saige"],
    ["434","Nehemiah","Carmen"], ["435","Edgar","Charli"], ["436","Johnny","Mckenzie"], ["437","Clark","Matilda"],   ["438","Eden","Miracle"],
    ["439","Gunner","Destiny"], ["440","Isaias","Alicia"], ["441","Esteban","Elle"], ["442","Hank","Colette"], ["443","Alijah","Anya"],
    ["444","Solomon","Madeleine"], ["445","Wells","Oaklee"], ["446","Sutton","Skye"], ["447","Royce","Cali"], ["448","Callen","Daleyza"],
    ["449","Reece","Alexis"], ["450","Gianni","Holly"], ["451","Noel","Katalina"], ["452","Quinn","Miley"], ["453","Raphael","Alanna"],
    ["454","Corbin","Felicity"], ["455","Erik","Joy"], ["456","Tripp","Helena"], ["457","Atreus","Makayla"], ["458","Francis","Amirah"],
    ["459","Kayce","Maia"], ["460","Callahan","Armani"], ["461","Devin","Alma"], ["462","Troy","Anahi"], ["463","Sylas","Ari"],   ["464","Fabian","Bianca"],
    ["465","Zaire","Scarlet"], ["466","Donovan","Amiyah"], ["467","Johnathan","Dorothy"], ["468","Frank","Stephanie"],   ["469","Lewis","Fernanda"],
    ["470","Moshe","Briana"], ["471","Adan","Alison"], ["472","Alexis","Lorelai"], ["473","Tadeo","Renata"], ["474","Ronin","Macie"],
    ["475","Marcos","Makenna"], ["476","Kieran","Imani"], ["477","Leonidas","Jimena"], ["478","Bo","Kate"], ["479","Kendrick","Liana"], 
    ["480","Ruben","Cameron"], ["481","Camilo","Lyra"], ["482","Garrett","Maddison"], ["483","Matthias","Izabella"],   ["484","Emanuel","Amanda"],
    ["485","Jeffrey","Lorelei"], ["486","Collin","Dayana"], ["487","Lucian","Gracelyn"], ["488","Augustus","Opal"],   ["489","Memphis","Nadia"], 
    ["490","Rowen","Brinley"], ["491","Yusuf","Madelynn"], ["492","Finnegan","Calliope"], ["493","Makai","Paris"],   ["494","Lionel","Camryn"], 
    ["495","Caiden","Danielle"], ["496","Rodrigo","Cassidy"], ["497","Uriel","Cecelia"], ["498","Lucca","Haisley"],   ["499","Philip","Jordan"],
    ["500","Andy","Faye"], ["501","Kaison","Marlee"], ["502","Jaiden","Bonnie"], ["503","Porter","Allie"], ["504","Jasiah","Edith"],   ["505","Ridge","Emmy"], 
    ["506","Frederick","Mae"], ["507","Amiri","Kaliyah"], ["508","Rocco","Oakleigh"], ["509","Asa","Meredith"], ["510","Ayaan","Carter"],
    ["511","Kason","Kamryn"], ["512","Denver","Ariah"], ["513","Dalton","Maxine"], ["514","Major","Heaven"], ["515","Valentino","April"],
    ["516","Allen","Blaire"], ["517","Kolton","Jennifer"], ["518","Zaiden","Leona"], ["519","Ariel","Murphy"], ["520","Rome","Ivory"], 
    ["521","Ford","Florence"], ["522","Leland","Lexi"], ["523","Marcelo","Angel"], ["524","Seth","Alondra"], ["525","Jamir","Hanna"],   ["526","Leandro","Rhea"],
    ["527","Miller","Bristol"], ["528","Roberto","Amalia"], ["529","Alessandro","Katie"], ["530","Gregory","Monroe"],   ["531","Hezekiah","Emelia"],
    ["532","Jonas","Maliyah"], ["533","Cassian","Kora"], ["534","Deacon","Ariya"], ["535","Jaxton","Mariam"], ["536","Keanu","Lyric"],
    ["537","Alonzo","Makenzie"], ["538","Moises","Frankie"], ["539","Conrad","Jacqueline"], ["540","Drew","Jazlyn"],   ["541","Bruce","Legacy"],
    ["542","Mohamed","Margo"], ["543","Anakin","Clementine"], ["544","Soren","Maren"], ["545","Mack","Paislee"],   ["546","Pierce","Alejandra"],
    ["547","Kylan","Sevyn"], ["548","Princeton","Jolene"], ["549","Zain","Averie"], ["550","Trevor","Briar"], ["551","Morgan","Yaretzi"],   ["552","Ozzy","Gabrielle"],
    ["553","Roy","Jessica"], ["554","Dominick","Rylie"], ["555","Shane","Alia"], ["556","Hamza","Zahra"], ["557","Moses","Emerie"],
    ["558","Dax","Lilian"], ["559","Lawrence","Arleth"], ["560","Ander","Virginia"], ["561","Ledger","Avianna"],   ["562","Enrique","Royalty"],
    ["563","Rayan","Azariah"], ["564","Johan","Kenzie"], ["565","Saul","Kyla"], ["566","Jamari","Sierra"], ["567","Armando","Halo"],   ["568","Kaysen","Holland"],
    ["569","Samson","Reyna"], ["570","Azariah","Thalia"], ["571","Maximilian","Keira"], ["572","Rio","Capri"],   ["573","Braylen","Marina"], ["574","Julio","Noemi"],
    ["575","Mohammad","Amber"], ["576","Cassius","Miranda"], ["577","Kasen","Sariyah"], ["578","Maximo","Rosalia"],   ["579","Omari","Indie"], 
    ["580","Clay","Oaklyn"], ["581","Izaiah","Anne"], ["582","Lian","Mara"], ["583","Emir","Lina"], ["584","Jaime","Wrenlee"],   ["585","Samir","Mina"], 
    ["586","Gerardo","Louise"], ["587","Kaizen","Beatrice"], ["588","Zachariah","Jovie"], ["589","Jayson","Ivanna"],   ["590","Albert","Nalani"], 
    ["591","Taylor","Journi"], ["592","Sincere","Marceline"], ["593","Cillian","Ailani"], ["594","Gunnar","Myra"],   ["595","Boone","Mavis"],
    ["596","Raul","Aliana"], ["597","Jamie","Kinley"], ["598","Jayceon","Ainsley"], ["599","Scott","Jaylani"], ["600","Westin","Eve"],
    ["601","Danny","Iyla"], ["602","Arjun","Leyla"], ["603","Kamden","Alexa"], ["604","Colby","Arlet"], ["605","Peyton","Lylah"],   ["606","Koen","Charleigh"], 
    ["607","Nikolai","Chaya"], ["608","Dorian","Cleo"], ["609","Ocean","Tiana"], ["610","Louie","Estella"], ["611","Layton","Nellie"],
    ["612","Ronald","Winnie"], ["613","Jase","Yara"], ["614","Kyro","Mikayla"], ["615","Benson","Dallas"], ["616","Davis","Sasha"],
    ["617","Huxley","Scottie"], ["618","Kenzo","Hadassah"], ["619","Conor","Amani"], ["620","Mohammed","Ila"],   ["621","Arturo","Kaitlyn"], 
    ["622","Phillip","Ellianna"], ["623","Augustine","Abby"], ["624","Reign","Skyler"], ["625","Yosef","Amaia"],   ["626","Kareem","Freyja"], 
    ["627","Keegan","Romina"], ["628","Vicente","Lennox"], ["629","Salem","Jenna"], ["630","Reese","Kennedi"],   ["631","Fletcher","Kayleigh"],
    ["632","Shawn","Melany"], ["633","Braylon","Amoura"], ["634","Alden","Mckinley"], ["635","Julien","Angelica"],   ["636","Cannon","Keilani"],
    ["637","Chaim","Michaela"], ["638","Gustavo","Zariyah"], ["639","Boston","Cassandra"], ["640","Zeke","Noah"], ["641","Eliam","Remy"], 
    ["642","Corey","Nia"], ["643","Dennis","Reina"], ["644","Madden","Milan"], ["645","Marvin","Jazmin"], ["646","Elio","Davina"],   ["647","Krew","Della"],
    ["648","Ahmed","Dylan"], ["649","Layne","Marie"], ["650","Nikolas","Galilea"], ["651","Mac","Violeta"], ["652","Otis","Jaliyah"],
    ["653","Harlan","Jenesis"], ["654","Azriel","Melina"], ["655","Emmitt","Isabela"], ["656","Brixton","Priscilla"],   ["657","Donald","Emberly"],
    ["658","Musa","Erin"], ["659","Amos","Aliza"], ["660","Jamison","Eileen"], ["661","Dario","Shelby"], ["662","Roland","Kelsey"],   ["663","Zakai","Laney"],
    ["664","Aarav","Siena"], ["665","Caspian","Braelynn"], ["666","Finnley","Analia"], ["667","Raylan","Elliott"],   ["668","Mauricio","Rosa"], 
    ["669","Briar","Aleena"], ["670","Wilson","Leslie"], ["671","Chosen","Gloria"], ["672","Sam","Kataleya"], ["673","Tru","Martha"],   ["674","Trace","Irene"], 
    ["675","Waylen","Clover"], ["676","Quincy","Penny"], ["677","Santana","Ryan"], ["678","Creed","Kaeli"], ["679","Jakari","Taytum"],   ["680","Westley","Karsyn"], 
    ["681","Amias","Kathryn"], ["682","Azrael","Estrella"], ["683","Drake","Adrianna"], ["684","Duke","Flora"], ["685","Ahmad","Goldie"],
    ["686","Axton","Halle"], ["687","Chandler","Haley"], ["688","Hassan","Sloan"], ["689","Houston","Fallon"], ["690","Tommy","Macy"],   ["691","Eliseo","Vienna"],
    ["692","Dustin","Janelle"], ["693","Leonard","Elowyn"], ["694","Kyree","Megan"], ["695","Truett","Azari"], ["696","Abdiel","Maci"],   ["697","Azael","Aya"],
    ["698","Ezrah","Kyra"], ["699","Zamir","Lillie"], ["700","Dexter","Milena"], ["701","Salvador","Birdie"], ["702","Uriah","Liv"],   ["703","Ryland","Christina"],
    ["704","Zyair","Novah"], ["705","Karim","Zelda"], ["706","Lee","Paula"], ["707","Rhodes","Julie"], ["708","Bruno","Selene"],   ["709","Case","Khaleesi"],
    ["710","Mylo","Chelsea"], ["711","Valentin","Estelle"], ["712","Abram","Karla"], ["713","Avyaan","Chana"], ["714","Cal","Marigold"],   ["715","Keith","Laurel"],
    ["716","Alvaro","Promise"], ["717","Enoch","Rayna"], ["718","Trey","Alisson"], ["719","Clyde","Bethany"],   ["720","Nathanael","Jemma"], ["721","Khai","Yareli"],
    ["722","Rex","Adalee"], ["723","Zaid","Andi"], ["724","Dutton","Coraline"], ["725","Skyler","Hana"], ["726","Tomas","Kiana"],   ["727","Wylder","Madilynn"], 
    ["728","Darius","Monica"], ["729","Crue","Charley"], ["730","Jakai","Dior"], ["731","Zayd","Arlette"], ["732","Gage","Lara"],   ["733","Riggs","Whitley"],
    ["734","Wayne","Love"], ["735","Jiraiya","Zaniyah"], ["736","Junior","Inaya"], ["737","Aryan","Angie"], ["738","Carmelo","Elodie"],   ["739","Conner","Nola"], 
    ["740","Alberto","Rivka"], ["741","Alfredo","Kendra"], ["742","Loyal","Marilyn"], ["743","Douglas","Aleah"],   ["744","Vincenzo","Emerald"], ["745","Aron","Persephone"],
    ["746","Casen","Addilyn"], ["747","Forest","Amayah"], ["748","Avi","Bridget"], ["749","Bellamy","Giana"], ["750","Emery","Johanna"],   ["751","Bridger","Kenna"],
    ["752","Brock","Milana"], ["753","Misael","Baylor"], ["754","Lennon","Brynleigh"], ["755","Zahir","Kensley"],   ["756","Boden","Zaria"], ["757","Derrick","Ellis"], 
    ["758","Dilan","Aviana"], ["759","Roger","Lacey"], ["760","Marcel","Leilany"], ["761","Rayden","Drew"], ["762","Jefferson","Ezra"],   ["763","Alvin","Lenora"],
    ["764","Kaiser","Loretta"], ["765","Blaze","Adley"], ["766","Dillon","Novalee"], ["767","Magnus","Aila"], ["768","Quentin","Karina"],   ["769","Ray","Adhara"],
    ["770","Dakari","Georgina"], ["771","Lachlan","Emmie"], ["772","Ty","Theodora"], ["773","Abdullah","Kelly"], ["774","Chris","Kylee"],   ["775","Orlando","Lottie"], 
    ["776","Yael","Malaysia"], ["777","Gian","Paulina"], ["778","Benicio","Lakelynn"], ["779","Franco","Dani"],   ["780","Evander","Denver"], ["781","Flynn","Dulce"],
    ["782","Harry","Jamie"], ["783","Robin","Sky"], ["784","Sevyn","Carly"], ["785","Hugh","Kinslee"], ["786","Aries","Marisol"],   ["787","Cason","Henley"],
    ["788","Idris","Jayleen"], ["789","Ambrose","Jream"], ["790","Issac","Cheyenne"], ["791","Yehuda","Maisy"], ["792","Brycen","Noor"],   ["793","Cayson","Robin"],
    ["794","Rey","Savanna"], ["795","Santos","Ramona"], ["796","Ben","Aileen"], ["797","Nelson","Kaiya"], ["798","Wes","Emberlynn"],   ["799","Westyn","Jessie"],
    ["800","Khaza","Zayla"], ["801","Bjorn","Lea"], ["802","Kiaan","Samira"], ["803","Seven","Araceli"], ["804","Watson","Azaria"],   ["805","Gatlin","Pearl"],
    ["806","Izael","Elyse"], ["807","Stanley","Hunter"], ["808","Allan","Kori"], ["809","Jahmir","Louisa"], ["810","Landen","Kamari"],   ["811","Neil","Nyomi"],
    ["812","Quinton","Skyla"], ["813","Chozen","Treasure"], ["814","Noe","Alexia"], ["815","Reuben","Gwen"], ["816","Damir","Alena"],   ["817","Bear","Tallulah"], 
    ["818","Jimmy","Veda"], ["819","Kannon","Mikaela"], ["820","Lance","Kya"], ["821","Melvin","Scout"], ["822","Remi","Valery"],   ["823","Yousef","Adele"], 
    ["824","Lochlan","Livia"], ["825","Arian","Naya"], ["826","Kenji","Ocean"], ["827","Khari","Iliana"], ["828","Rohan","Bellamy"],   ["829","Legacy","Celia"],
    ["830","Edison","Vada"], ["831","Emory","Zaylee"], ["832","Rudy","Ashlyn"], ["833","Eliel","Mercy"], ["834","Aden","Zendaya"],   ["835","Byron","Berkley"],
    ["836","Dereck","Marlowe"], ["837","Everest","Arely"], ["838","Yahir","Aspyn"], ["839","Guillermo","Maddie"], ["840","Alec","Avani"],   ["841","Brodie","Belen"],
    ["842","Massimo","Linda"], ["843","Mitchell","Luz"], ["844","Anders","Teresa"], ["845","Alonso","Meilani"], ["846","Jaxxon","Nala"],   ["847","Tony","Malaya"], 
    ["848","Jireh","Amiri"], ["849","Kingsley","Anais"], ["850","Jerry","Lisa"], ["851","Ayan","Ivey"], ["852","Brayan","Katelyn"],   ["853","Ramon","Dania"],
    ["854","Jagger","Zoya"], ["855","Elisha","Ailany"], ["856","Vihaan","Artemis"], ["857","Teo","Rayne"], ["858","Eddie","Brittany"],   ["859","Judson","Cielo"],
    ["860","Leif","Janiyah"], ["861","Trenton","Kallie"], ["862","Grey","Yasmin"], ["863","Joziah","Zora"], ["864","Felipe","Aliya"],   ["865","Jesiah","Billie"],
    ["866","Zyon","Elia"], ["867","Kyaire","Khalani"], ["868","Ernesto","Rosalina"], ["869","Ishaan","Zhuri"], ["870","Matheo","Ainara"],   ["871","Ricky","Alitzel"],
    ["872","Fisher","Stormi"], ["873","Keaton","Cynthia"], ["874","Kylen","Elina"], ["875","Marcellus","Lilianna"],   ["876","Izan","Zainab"], ["877","Leroy","Barbara"],
    ["878","Jedidiah","Ensley"], ["879","Ignacio","Miller"], ["880","Ira","Waverly"], ["881","Zev","Winona"], ["882","Mustafa","Jaycee"],   ["883","Yahya","Andie"],
    ["884","Aurelio","Kimber"], ["885","Brendan","Marianna"], ["886","Calum","Keyla"], ["887","Jericho","Baylee"],   ["888","Nixon","Emryn"], ["889","Demetrius","Giuliana"],
    ["890","Eiden","Karter"], ["891","Rocky","Liberty"], ["892","Langston","Sol"], ["893","Jovanni","Amelie"], ["894","Mathew","Hadlee"],   ["895","Landyn","Harmoni"],
    ["896","Murphy","Tiffany"], ["897","Axl","Chandler"], ["898","Dane","Elliot"], ["899","Jrue","Lilyana"], ["900","Justice","Nori"],   ["901","Kellan","Salma"],
    ["902","Semaj","Dalia"], ["903","Thaddeus","Judith"], ["904","Curtis","Madalyn"], ["905","Dash","Raquel"], ["906","Zavier","Jolie"],   ["907","Devon","Keily"],
    ["908","Joe","Magdalena"], ["909","Joey","Yamileth"], ["910","Jon","Bria"], ["911","Harlem","Amaris"], ["912","Jairo","Harlee"],   ["913","Ryatt","August"],
    ["914","Salvatore","Ayleen"], ["915","Van","Kimora"], ["916","Zechariah","Braelyn"], ["917","Coleson","Kamiyah"],   ["918","Eugene","Indy"], ["919","Kellen","Princess"], 
    ["920","Alistair","Ruthie"], ["921","Colten","Ashlynn"], ["922","Jabari","Jazmine"], ["923","Lucien","Laylani"],   ["924","Castiel","Marleigh"],
    ["925","Cain","Raina"], ["926","Harold","Roselyn"], ["927","Alfred","Simone"], ["928","Benedict","Anika"],   ["929","Shmuel","Lakelyn"], ["930","Duncan","Luella"],
    ["931","Ermias","Nataly"], ["932","Yadiel","Giovanna"], ["933","Imran","Greta"], ["934","Kaisen","Solana"], ["935","Zen","Bailee"],   ["936","Eren","Joelle"],
    ["937","Kolson","Kara"], ["938","Kye","Etta"], ["939","Jasiel","Julissa"], ["940","Kyren","Kai"], ["941","Marlon","Avayah"],   ["942","Palmer","Nancy"],
    ["943","Adler","Alianna"], ["944","Aldo","Ayra"], ["945","Meir","Sarahi"], ["946","Osiris","Eleanora"], ["947","Ameer","Kenia"],   ["948","Kartier","Emmeline"],
    ["949","Wesson","Luisa"], ["950","Ahmir","Xyla"], ["951","Mordechai","Cadence"], ["952","Nova","Reya"], ["953","Randy","Blessing"],   ["954","Shepard","Elouise"],
    ["955","Talon","Emiliana"], ["956","Vance","Annika"], ["957","Asaiah","Lilia"], ["958","Boaz","Mazie"], ["959","Kenai","Saoirse"],   ["960","Jones","Aura"], 
    ["961","Carl","Aleyna"], ["962","Stefan","Kassidy"], ["963","Deandre","Carla"], ["964","Kelvin","Indigo"],   ["965","Leighton","Saanvi"], ["966","Yaakov","Tru"],
    ["967","Foster","Winifred"], ["968","Rishi","Layne"], ["969","Yisroel","Malayah"], ["970","Darwin","Dana"], ["971","Neo","Deborah"],   ["972","Titan","Hayley"],
    ["973","Maurice","Sapphire"], ["974","Mccoy","Seraphina"], ["975","Alfonso","Kahlani"], ["976","Henrik","Nyra"],   ["977","Jeremias","Quincy"],
    ["978","Kole","Soleil"], ["979","Mael","Allyson"], ["980","True","Paloma"], ["981","Veer","Whitney"], ["982","Jadiel","Laylah"],   ["983","Karsyn","Violette"],
    ["984","Mekhi","Kairi"], ["985","Atharv","Leanna"], ["986","Darren","Natasha"], ["987","Eliezer","Ainhoa"],   ["988","Gordon","Alaiya"], ["989","Mikael","Esperanza"],
    ["990","Stone","Amyra"], ["991","Wren","Clare"], ["992","Ephraim","Neriah"], ["993","Osman","Araya"], ["994","Ulises","Aadhya"],   ["995","Kody","Elisabeth"],
    ["996","Thatcher","Sariah"], ["997","Abner","Shay"], ["998","Cullen","Angelique"], ["999","Damari","Ayah"],   ["1000","Hollis","Aylani"]
];
window.Males = En_Names.map(X=>X[1]?.toLowerCase());
window.Females = En_Names.map(X=>X[2]?.toLowerCase());
Males = Males.filter(X=>X!=null);
Females = Females.filter(X=>X!=null);
log("Males:", Males.length);
log("Females:", Females.length);
// EOF
