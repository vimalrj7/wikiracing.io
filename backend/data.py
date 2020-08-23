from wikipedia import summary

emojis = {
    '&#128053;',    #Monkey
    '&#128054;',    #Dog
    '&#128058;',    #Wolf
    '&#129418;',    #Fox
    '&#128049;',    #Cat
    '&#129409;',    #Lion
    '&#128047;',    #Tiger
    '&#128052;',    #Horse
    '&#129412;',    #Unicorn
    '&#128046;',    #Corn
    '&#128055;',    #Pig
    '&#128045;',    #Mouse
    '&#128057;',    #Hamster
    '&#128048;',    #Rabbit
    '&#128059;',    #Bear
    '&#128040;',    #Koala
    '&#128060;',    #Panda
    '&#128056;',    #Frog
    '&#128032;',    #Fish
    '&#128023;',    #Boar
    '&#128020;',    #Chicken
    '&#129417;',    #Owl
    '&#129408;',    #Crab
    '&#128025;',    #Octupus
    '&#129419;',    #Butterfly
    '&#128012;',    #Snail
    '&#128028;',    #Ant
    '&#128030;',    #Beetle
    '&#128050;',    #Dragon
    '&#128039;',    #Penguin
    '&#129413;',    #Eagle
    '&#129414;',    #Duck
    '&#129416;',    #Shark
}

pages = [
    ('Pilot_error', 'Tinder'), 
    ('Ohio_State_Route_38', 'Communism'), 
    ('Mucilaginibacter_litoreus', 'Dab_(dance)'), 
    ('Bulford', 'Fu_Manchu'), 
    ('World_Bicycle_Day', 'Kazimierz_Wyka'), 
    ('Roberto_Simanowski', 'Robert_P._Bush')
]

def gen_summary_dictionary(titles):
    dictionary = '{\n'
    for title in titles:
        dictionary += "\'" + title[0] + "\': \'\'\'" + summary(title[0], chars = 300) + "\'\'\',\n"
        dictionary += "\'" + title[1] + "\': \'\'\'" + summary(title[1], chars = 300) + "\'\'\',\n"
    return dictionary + '}'

print(gen_summary_dictionary(pages))

{
'Pilot_error': '''Historically, the term pilot error has been used to describe an accident in which an action or decision made by the pilot was the cause or a contributing factor that led to the accident, but also includes the pilot's failure to make a correct decision or take proper action. Errors are intentional actions...''',
'Tinder': '''Rinder is a German language occupational surname, which means "cattle farmer", from the German word Rind, meaning a cow. The name may refer to:

Alexandra Rinder (born 1998), German bodyboarder
Frederick Rinder (1858–1938), British sports administrator
Friedl Rinder (1905–2001), German chess player
Lawrence...''',
'Ohio_State_Route_38': '''State Route 38 (SR 38) is a south-north state highway in the state of Ohio. Its southern terminus is near Bloomingburg and Washington Court House at the U.S. Route 62 / SR 3 concurrency and its northern terminus is in Marysville at the intersection of 5th Street and Main Street where the road continues...''',
'Communism': '''Communism (from Latin communis, 'common, universal') is a philosophical, social, political, economic ideology and movement whose ultimate goal is the establishment of a communist society, namely a socioeconomic order structured upon the ideas of common ownership of the means of production and the absence...''',
'Mucilaginibacter_litoreus': '''Mucilaginibacter litoreus is a Gram-negative, facultatively aerobic, non-spore-forming and rod-shaped bacterium from the genus of Mucilaginibacter which has been isolated from marine sand from the western coast of Korea.    


== References ==


== External links ==
Type strain of Mucilaginibacter litoreus at...''',
'Dab_(dance)': '''Dabbing, or the dab, is a simple dance move or gesture in which a person drops their head into the bent crook 
of a slanted, upwardly angled arm, while raising the opposite arm out straight in a parallel direction. Since 2015, dabbing has 
been used as a gesture of triumph or playfulness, becoming a youthful...''',
'Bulford': '''Bulford is a village and civil parish in Wiltshire, England, close to Salisbury Plain.  The village is close to Durrington and about 1.5 miles (2.4 km) north of the town of Amesbury. The Bulford Camp army base is separate from the village but within the parish.
The Salisbury Avon forms the western boundary...''',
'Fu_Manchu': '''Dr. Fu Manchu is a fictional villain who was introduced in a series of novels by the English author Sax Rohmer during the first half of the 20th century. The character was also extensively featured in cinema, television, radio, comic strips and comic books for over 90 years and he has also become an...''',
'World_Bicycle_Day': '''In April 2018, the United Nations General Assembly declared June 3 as International World Bicycle Day. The resolution for World Bicycle Day recognizes "the uniqueness, longevity and versatility of the Bicycle, which has been in use 
for two centuries, and that it is a simple, affordable, reliable, clean...''',
'Kazimierz_Wyka': '''Kazimierz Wyka (1910–1975) was a Polish literary historian, literary critic, and professor at the Jagiellonian University in Kraków following World War II. He was a deputy to the Polish parliament (Sejm) from 1952 to 1956 during the darkest years of Stalinism in Poland.


== Life ==
Wyka was a son of a...''',
'Roberto_Simanowski': '''Roberto Simanowski (born 1963) is a German scholar of literature and media studies and founder of dichtung-digital.
Simanowski studied German literature and history at the University of Jena where he finished his PhD on mass-culture around 1800 with a grant by the German Studienstiftung in 1996. He worked...''',
'Robert_P._Bush': '''Robert P. Bush (March 31, 1842 in Branchport, Yates County, New York - January 8, 1923 in Elmira, Chemung County, New York) was an American physician, soldier and politician.


== Life ==
He was the son of Dr. Wynans Bush (1799–1889) and Julia Ann Loomis Bush (1805–1898). He was educated at academies in...''',     
}