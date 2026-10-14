/* ===== CLOVER HOLLOW : core data ===== */
const TOTAL_MONTHS = 36;
const MONTH_NAMES = ['April','May','June','July','August','September','October','November','December','January','February','March'];
const SEASONS = ['spring','spring','summer','summer','summer','autumn','autumn','autumn','winter','winter','winter','spring'];
const START_AGE = 18;
const UPKEEP = 65;
const GROWTH = 0.6;   // global stat-gain multiplier (tuning knob)

const STATS = [
  { id:'str',   name:'Strength', icon:'💪', color:'#ea7b5b' },
  { id:'wit',   name:'Wit',      icon:'📚', color:'#6fb4ee' },
  { id:'charm', name:'Charm',    icon:'🎀', color:'#e65f86' },
  { id:'craft', name:'Craft',    icon:'🎨', color:'#a98ae6' },
  { id:'kind',  name:'Kindness', icon:'🍀', color:'#55b985' },
  { id:'nerve', name:'Nerve',    icon:'🔥', color:'#f6a623' }
];
const STATK = STATS.map(s => s.id);
const STATD = Object.fromEntries(STATS.map(s => [s.id, s]));

const PIDS = ['gareth','fenn','mugi','suzu'];
const PEOPLE = {
  gareth: { id:'gareth', name:'Gareth', img:'lion',  h:66, likes:['str','nerve'], bg:'town',    tag:'Knight-in-training', color:'#e8a85a' },
  fenn:   { id:'fenn',   name:'Fenn',   img:'fox',   h:66, likes:['wit','charm'], bg:'town',    tag:'Archive apprentice', color:'#f08a3c', time:'dusk' },
  mugi:   { id:'mugi',   name:'Mugi',   img:'shiba', h:60, likes:['kind','str'],  bg:'pasture', tag:'Pasture farmhand',   color:'#d9a05b' },
  suzu:   { id:'suzu',   name:'Suzu',   img:'cat',   h:48, likes:['charm','wit'], bg:'town',    tag:'Market stall heir',  color:'#c9d4e6' }
};
const SPR_H = { rabbit:60, sheep:40, gareth:66, fenn:66, mugi:60, suzu:48 };

const KEEPSAKES = [
  { id:'watch',  icon:'⌚', name:"Grandma's pocket watch", desc:'Wit +8, Craft +2',    fx:{ wit:8, craft:2 } },
  { id:'sword',  icon:'🗡️', name:'A wooden practice sword', desc:'Strength +6, Nerve +4', fx:{ str:6, nerve:4 } },
  { id:'ribbon', icon:'🎀', name:'A silk ear ribbon',      desc:'Charm +8, Craft +2',  fx:{ charm:8, craft:2 } },
  { id:'brush',  icon:'🖌️', name:'A set of paint brushes', desc:'Craft +8, Charm +2',  fx:{ craft:8, charm:2 } },
  { id:'clover', icon:'🍀', name:'A four-leaf clover charm', desc:'Kindness +8, Nerve +2', fx:{ kind:8, nerve:2 } }
];

/* ---------- activities ---------- */
// cat: lesson | work | rest.  g = stat gains. cost / earn in coins.
const ACT = {
  spar:   { cat:'lesson', icon:'⚔️', name:'Sparring Yard',     desc:'Wooden swords and bruised pride.',     cost:65, g:{str:4,nerve:1}, stress:8,  health:-5, bg:'town',    who:'gareth',
            txt:['{n} swings until both arms shake, then swings some more.','A tumble in the dust, a lesson in not tumbling next time.','The straw dummy takes a beating. It deserved it.'] },
  study:  { cat:'lesson', icon:'📚', name:'Archive Study',     desc:'Dust, ink, and a very quiet room.',    cost:65, g:{wit:4,craft:1}, stress:6,  health:0,  bg:'town',    who:'fenn',
            txt:['{n} reads three chapters and understands two of them. Progress!','A page of old maps turns out to be oddly useful.','The Archive smells like old paper and good ideas.'] },
  dance:  { cat:'lesson', icon:'💃', name:'Dance & Manners',   desc:'Twirls, bows, and which fork to use.', cost:70, g:{charm:4,craft:1}, stress:5, health:-2, bg:'town',    who:'suzu',
            txt:['One-two-three, one-two-three. Only two toes were stepped on.','{n} learns the bow that makes shopkeepers smile.','The teacher says, “Chin up, ears up, heart up.”'] },
  atelier:{ cat:'lesson', icon:'🎨', name:'Paint & Stitch',    desc:'Pigments, thread, and a sunny desk.',  cost:55, g:{craft:4,charm:1}, stress:4, health:0,  bg:'home',    who:null,
            txt:['A lopsided cushion, but it’s a cushion with feelings.','{n} mixes a blue that is almost exactly the evening sky.','Needle, thread, tongue stuck out in concentration.'] },
  chapel: { cat:'lesson', icon:'🕯️', name:'Help the Neighbors', desc:'Soup, chores, and small kindnesses.', cost:15, g:{kind:4}, stress:3, health:-1, bg:'town', who:'mugi',
            txt:['{n} carries groceries for three neighbors and a very suspicious goose.','An old badger tells {n} a story that goes on for a while. {n} listens to every word.','Soup is delivered. Smiles are collected.'] },
  roof:   { cat:'lesson', icon:'🌙', name:'Rooftop Run',        desc:'Leaping gaps. Do not look down.',      cost:20, g:{nerve:4,str:1}, stress:7,  health:-6, bg:'town', time:'dusk', who:'fenn',
            txt:['{n} clears a gap that was definitely wider than it looked.','The wind whistles through the ears. The heart whistles back.','A shaky landing, a grin, and a promise never to tell Nimbus.'] },

  farm:   { cat:'work', icon:'🌾', name:'Pasture Farmhand',   desc:'Hay, hooves, and honest sweat.',        earn:85, g:{str:2,kind:1}, stress:7, health:-8, bg:'pasture', who:'mugi',
            txt:['Bales lifted, fences checked, one goat reasoned with. Mostly.','The sun is warm and the hay is itchy.','A full day on the pasture. Your paws are proud.'] },
  stall:  { cat:'work', icon:'🧺', name:'Market Stall',       desc:'Smile, haggle, wrap, repeat.',          earn:78, g:{charm:2,wit:1}, stress:5, health:-2, bg:'town', who:'suzu',
            txt:['“Fresh today!” {n} says, and, for once, it’s even true.','A customer haggles for ten minutes over a single turnip.','The stall sells out by noon. Everybody’s impressed, including {n}.'] },
  scribe: { cat:'work', icon:'🖋️', name:'Archive Scribe',      desc:'Copy records at the sunny desk.',       earn:74, g:{wit:2,craft:1}, stress:5, health:0, bg:'home', who:'fenn',
            txt:['Forty pages copied. One tiny ink smudge, one big sigh of relief.','{n}’s handwriting is getting suspiciously elegant.','Scratch, scratch, scratch. The kettle sings in the background.'] },
  tavern: { cat:'work', icon:'🍻', name:'Tavern Helper',      desc:'Loud, long, and generous with tips.',   earn:95, g:{nerve:2,charm:1}, stress:10, health:-4, bg:'town', time:'dusk', who:'gareth',
            txt:['Seven plates, three songs, one very drunk bard. {n} survives.','A merchant tips in cheese. Cheese counts.','{n} is nearly run over by a barrel that had personal goals.'] },
  herbs:  { cat:'work', icon:'🌿', name:'Herb Gathering',     desc:'Gentle, green, and a bit sneezy.',      earn:62, g:{kind:2,craft:1}, stress:-2, health:2, bg:'pasture', who:'mugi',
            txt:['Chamomile, mint, and one extremely aggressive nettle.','The basket fills up with sweet-smelling bundles.','A quiet morning of sorting weeds from medicine.'] },
  courier:{ cat:'work', icon:'📮', name:'Courier Runs',       desc:'Letters and parcels, on your feet.',    earn:80, g:{str:1,nerve:2}, stress:6, health:-5, bg:'pasture', who:null,
            txt:['Seven deliveries before lunch. {n} is a blur with ears.','A dog barks. {n} runs faster. Both are happy.','The mail must go through, and so must {n}.'] },

  rest:   { cat:'rest', icon:'🛌', name:'Sleep In',           desc:'Blankets. Tea. Zero ambition.',         stress:-20, health:22, bg:'home', who:null,
            txt:['{n} sleeps until the sun is almost embarrassed.','Nimbus leaves tea on the desk and tiptoes out.','Nothing happens, and it is wonderful.'] },
  walk:   { cat:'rest', icon:'🦋', name:'Meadow Walk',        desc:'Fresh air. Anyone could turn up.',      stress:-14, health:8, bg:'pasture', who:'random', g:{kind:1},
            txt:['A butterfly follows {n} for half a mile.','Wildflowers, long grass, and no schedule at all.','{n} naps under a tree and wakes up with a clover in one ear.'] }
};
const ACT_ORDER = {
  lesson: ['spar','study','dance','atelier','chapel','roof'],
  work:   ['farm','stall','scribe','tavern','herbs','courier'],
  rest:   ['rest','walk']
};
const HANG_COST = 15;

/* ---------- little flavor pools ---------- */
const CAMEO = {
  gareth: [
    'Gareth marched past with a practice sword on his shoulder. “Rabbit! Posture! …Fine. Decent posture.”',
    'Gareth pretended not to watch from across the way, then gave a very official nod.',
    'Gareth jogged over, a little out of breath. “I had a spare minute. I chose to spend it here. Strategically.”'],
  fenn: [
    'Fenn appeared from nowhere, a book under one arm. “Careful. Someone might learn something.”',
    'A familiar orange tail flicked around a corner. “Not following you,” Fenn’s voice said. “Merely in the same places.”',
    'Fenn slid a folded riddle into {n}’s paw without a word, and winked.'],
  mugi: [
    'Mugi waved with his whole arm, grin crooked. “Need a hand? …Never mind, you’ve got it.”',
    'Mugi popped up with a warm bun in each paw. “Mum made too many. Obviously.”',
    'Mugi fell into step beside {n}, humming. Neither said much. It was nice.'],
  suzu: [
    'Suzu leaned over, tail flicking. “Sloppy. Do it again so I can beat you at it.”',
    'Suzu showed up with two cups of tea and handed one over. “Don’t read into it.”',
    'Suzu bumped {n}’s shoulder, smiling in a way she wouldn’t admit to. “Look at you. Almost as good as me.”']
};
const HANGOUT = {
  gareth: [
    [['_','{n} spends the afternoon helping Gareth polish his practice armor.'],['gareth','Don’t tell the other recruits I let someone help. …They’d all want to help, and they’re terrible at it.']],
    [['_','Gareth teaches {n} how to fall without getting hurt.'],['gareth','Falling is half of fighting. The other half is pretending you meant to.']],
    [['_','They share a bench in the square and watch the sun slide behind the half-timbered roofs.'],['gareth','Funny. Quiet doesn’t feel like losing when you’re around.']]
  ],
  fenn: [
    [['_','Fenn leads {n} down a row of shelves nobody visits.'],['fenn','The forbidden section. Forbidden only because nobody tells you where it is. Take a book. Return it. Tell no one.']],
    [['_','They trade riddles on the Archive steps until the lamps come on.'],['fenn','You’re getting better at this. That’s inconvenient. I like it.']],
    [['_','Fenn pulls a crumpled map out of his sleeve.'],['fenn','Hidden spots in Clover Hollow. Eleven, so far. You can be the twelfth person who knows. Don’t make it weird.']]
  ],
  mugi: [
    [['_','{n} helps Mugi lead the goats back to the pen. The goats do not cooperate.'],['mugi','They’re like this with everyone. Don’t take it personally. …Okay, take it a little personally.']],
    [['_','Mugi’s mother sends them off with a basket of warm bread.'],['mugi','Eat. Sit. The pasture is better with bread.']],
    [['_','They lie in the grass and name clouds.'],['mugi','That one’s a sheep. That one’s also a sheep. …I should look at more things.']]
  ],
  suzu: [
    [['_','Suzu hauls {n} to her stall to “learn from a professional”.'],['suzu','Rule one: smile like the apple is a gift. Rule two: it isn’t. Rule three: never admit rule two.']],
    [['_','They split a bag of roasted chestnuts on the fountain’s edge.'],['suzu','I’m not being nice. Chestnuts are just better with a witness.']],
    [['_','Suzu challenges {n} to a staring contest. Neither blinks for a suspiciously long time.'],['suzu','…Draw. I’ll allow it. This time.']]
  ]
};

/* ---------- festival companion lines ---------- */
const COMPANION = {
  lantern: {
    gareth:[['gareth','Lanterns, hm? You write a wish and let it float. I wished for— no. If I say it, it won’t come true.'],['_','His wish-paper is folded into a tiny, very tight square.']],
    fenn:  [['fenn','Everyone writes wishes. I write questions. The answers are usually more interesting.'],['fenn','…I did write one wish. Don’t look.']],
    mugi:  [['mugi','I’ve never missed one of these. Mum makes lantern buns. Here — still warm.'],['mugi','Make a wish. I’ll hold the string so it doesn’t tangle. …It always tangles.']],
    suzu:  [['suzu','I priced the lantern stands. Highway robbery. Anyway, I’m only here because you didn’t have a plan, obviously.'],['suzu','Race you to the water’s edge. Loser buys the dumplings.']]
  },
  snow: {
    gareth:[['gareth','A snow knight! Look, mine has a plume. Yours has… ears. Good ears. Strategic ears.'],['_','They build a very lopsided army and name every soldier.']],
    fenn:  [['fenn','Snowflakes are the only perfect lies: every one unique, none lasting. I like that.'],['_','He catches one on his sleeve and shows it off like treasure.']],
    mugi:  [['mugi','The goats hate snow. I like snow. Don’t tell the goats.'],['_','Mugi throws exactly one snowball, then apologizes for it, twice.']],
    suzu:  [['suzu','My family sells hot cider at triple the price. Don’t tell anyone I’m giving you a cup for free.'],['_','They sit on a crate, steam curling off the cups, watching the snow gather on the rooftops.']]
  }
};

/* ---------- sheep hints ---------- */
function sheepHint(S){
  const lo = STATS.slice().sort((a,b)=>S.st[a.id]-S.st[b.id])[0];
  const nxt = UPCOMING[S.m+1];
  if (S.stress >= 75) return ['hi', `Your ears are drooping, ${S.name}. Maybe a Sleep In would help? Stress is how small mistakes get big.`];
  if (S.health < 40)  return ['hi', `You look pale, dear. A rest or a walk wouldn’t hurt before anything heavy.`];
  if (S.coins < 60 && S.m>0)  return ['hi', `The coin jar is nearly empty. A job or two would help us breathe a little.`];
  if (nxt && Math.random()<.7) return ['happy', `Next month: ${nxt}. You may want to be ready.`];
  if (S.m === 0) return ['happy', `Pick two plans for the month, one for each half. Lessons grow you, work pays the bills, rest keeps you from wilting.`];
  const pool = [
    ['happy', `Your ${lo.name} is a little low. Not a problem, only an opportunity.`],
    ['hi',    `Friends are part of growing up too. Time spent with them isn’t wasted.`],
    ['happy', `Every plan has a little chance of going wonderfully. Or terribly. That’s planning!`],
    ['hi',    `Don’t forget: ${UPKEEP} coins a month for the house. It adds up, like cats.`],
    ['hi',    `Goal: ${objectiveOf(S)}`],
    ['happy', `There’s no wrong life to choose, ${S.name}. Only the one you actually want.`]
  ];
  return pool[Math.floor(Math.random()*pool.length)];
}

/* ===== CLOVER HOLLOW : events ===== */
// line forms: ['who','text',pose?] | {bg,time} | {cast:[..]} | {fx:{..}} | {c:[[label,fx,lines],..] or fn} | fn(S)=>lines
const UPCOMING = {
  1:'you may meet someone at the market', 2:'a new face on the pasture', 3:'a lion with a sword', 4:'Lantern Night on the river',
  5:'a late-night visitor at the Archive', 6:'the Harvest Fair contests', 8:'the Snow Festival', 12:'your birthday',
  16:'Lantern Night on the river', 17:'the Midsummer Games', 18:'the Harvest Fair contests', 20:'the Snow Festival',
  24:'your birthday', 28:'Lantern Night on the river', 29:'the Midsummer Games', 30:'the Grand Harvest Fair', 32:'the Snow Festival', 35:'the Spring Festival, and the end of the promise'
};

function companionLines(kind){
  return [{ c:(S)=>{
    const o = [];
    PIDS.filter(p=>S.met[p]).forEach(p=>o.push([`Go with ${PEOPLE[p].name}`, {aff:{[p]:8}, stress:-8}, [{cast:['rabbit',p]}, ...COMPANION[kind][p]]]));
    o.push(['Spend it with Nimbus', {stress:-12, kind:2}, [{cast:['rabbit','sheep']},
      ['sheep', kind==='lantern' ? 'Just us tonight? Good. Old sheep like quiet lanterns.' : 'Wool is finally good for something. Sit, sit, I’ll keep you warm.', 'happy'],
      ['n','Thanks, Nimbus. For all of it.']]]);
    o.push(['Go alone', {stress:-8, wit:1}, [['_','{n} wanders the festival alone, and thinks a long time about Grandma.']]]);
    return o;
  }}];
}

function contestLines(name, lvl){
  const thr = [[36,26,18],[58,44,32],[78,62,46]][lvl];
  const opts = [['Arm-wrestling (Strength)','str','gareth'],['Quiz tent (Wit)','wit','fenn'],['Dance-off (Charm)','charm','suzu'],
                ['Craft show (Craft)','craft','mugi'],['Helping-hands relay (Kindness)','kind','mugi'],['Fire-hoop dash (Nerve)','nerve','gareth']];
  return [
    ['sheep', `The ${name} has contests in every corner. Pick one and give it everything.`, 'happy'],
    { c: opts.map(([label,stat,cheer]) => [label, null, (S)=>{
        const score = S.st[stat] + Math.floor(Math.random()*21) - 8;
        const out = [];
        let rank, fx;
        if (score >= thr[0])      { rank='gold';   fx={coins:150, rep:3}; }
        else if (score >= thr[1]) { rank='silver'; fx={coins:80,  rep:2}; }
        else if (score >= thr[2]) { rank='bronze'; fx={coins:40,  rep:1}; }
        else                      { rank='none';   fx={stress:-4}; }
        if (S.met[cheer]) out.push({cast:['rabbit',cheer]}, [cheer, PEOPLE[cheer].name==='Gareth' ? 'Go on, rabbit! Elbows in!' : cheer==='fenn' ? 'Statistically, you’re going to win. I checked.' : cheer==='suzu' ? 'If you lose I’m telling everyone I trained you.' : 'You’ve got this! Think of bread!']);
        const text = { gold:'GOLD! The crowd roars and the judges can’t stop smiling.', silver:'Silver! A close finish, and a very good one.', bronze:'Bronze! A podium spot, and applause.', none:'Not this time. But {n} gave it a real go, and that counts.' }[rank];
        out.push(['_', text], {fx});
        if (S.met[cheer]) out.push({fx:{aff:{[cheer]: rank==='none'?3:5}}});
        return out;
    }]) }
  ];
}

function birthdayLines(age){
  const gift = (label, fx) => [label, fx, [['sheep','A fine choice. I’d been hoping you’d say that.','happy']]];
  return [
    {cast:['rabbit','sheep']},
    ['sheep', `Happy birthday! ${age} already. Time runs through us like wool through a spinner.`, 'happy'],
    ['sheep','I’ve only one gift, so I want you to choose. What would you like most?'],
    {c:[
      gift('A stack of books',   {wit:4,   stress:-3}),
      gift('Proper training gear',{str:4,  nerve:1}),
      gift('A new dress & ribbons', {charm:4, stress:-3}),
      gift('A real paint set',   {craft:4, stress:-3}),
      gift('A basket of tea & jam for the neighbors', {kind:4, stress:-3})
    ]},
    ['sheep','And…thank you for letting an old sheep be part of this.','proud']
  ];
}

const EVENTS = [
  /* ---------- introductions ---------- */
  { id:'intro_suzu', phase:'start', at:1, bg:'town', cast:['rabbit','suzu'], lines:[
    ['_','The market square is loud with clattering crates. {n} is carrying a basket for Nimbus when a white cat steps squarely into the path.'],
    ['suzu','Watch it! Those are display apples. Display apples have a reputation.'],
    ['n','Sorry! I’m {n}. I’m new.'],
    ['suzu','Ah. The sheep’s lodger. I’m Suzu. My family’s stall is the one that always sells out first.'],
    ['suzu','I’m just saying. In case you’re wondering who to buy from. Or who to compete with.'],
    {fx:{met:'suzu'}},
    {c:[
      ['Challenge her to a sales race someday.', {aff:{suzu:6}, nerve:1}, [['suzu','Ha! Bold. I like bold. I’ll even let you lose politely.']]],
      ['Buy an apple.', {aff:{suzu:4}, coins:-10, charm:1}, [['suzu','See? A person of taste.']]],
      ['Offer to help carry crates.', {aff:{suzu:5}, kind:1, str:1}, [['suzu','…Fine. But I’m not saying thank you.']]]
    ]}
  ]},
  { id:'intro_mugi', phase:'start', at:2, bg:'pasture', cast:['rabbit','mugi'], lines:[
    ['_','A gust of wind steals {n}’s hat and sends it tumbling into the pasture. A shiba in work gloves snatches it out of the air without looking up from the fence he’s mending.'],
    ['mugi','Yours? …Huh. You’re Nimbus’s new lodger. Word travels. I’m Mugi. This fence is… a work in progress.'],
    ['mugi','It falls down about once a week. Usually when I’m proudest of it.'],
    {fx:{met:'mugi'}},
    {c:[
      ['Help him hold the posts.', {str:1, aff:{mugi:6}, stress:2}, [['mugi','Left a bit. No, your other left. …Ha. There. Thank you, really.']]],
      ['Tell him it looks sturdy.', {kind:1, aff:{mugi:4}}, [['mugi','You’re a terrible liar. I appreciate it.']]],
      ['Ask about the farm.', {wit:1, aff:{mugi:4}}, [['mugi','Oats, sheep, two stubborn goats. Come by sometime. They hate everyone equally.']]]
    ]}
  ]},
  { id:'intro_gareth', phase:'start', at:3, bg:'town', cast:['rabbit','gareth'], lines:[
    ['_','In the town square, a lion in a too-big tunic slashes a wooden sword at a straw dummy. The dummy is winning.'],
    ['gareth','Hrah! …You, rabbit! Don’t stand in my swing arc. The Royal Knight Trials are three years away and I will NOT be embarrassed by a bystander.'],
    ['n','I’m just passing through. I’m {n}.'],
    ['gareth','Gareth. Future Captain of the Royal Guard. Remember it.'],
    {fx:{met:'gareth'}},
    {c:[
      ['Ask to try a swing.', null, (S)=> S.st.str>=16
        ? [{fx:{aff:{gareth:7}, str:1}}, ['gareth','Huh. Decent grip. You’ve done this before, haven’t you?']]
        : [{fx:{aff:{gareth:4}, str:1}}, ['_','The wooden sword turns out to be heavier than it looks. {n} spins twice and sits down.'], ['gareth','…Good effort. Terrible form. Great effort, though.']]],
      ['Tell him you’ll remember it.', {charm:1, aff:{gareth:5}}, [['gareth','Good! Tell your friends. Tell your children.']]],
      ['Point out that the dummy is winning.', {nerve:2, aff:{gareth:4}}, [['gareth','…!','' ],['gareth','…It IS winning.'],['_','He laughs, a big surprised laugh, and for a moment the whole square seems brighter.']]]
    ]}
  ]},
  { id:'intro_fenn', phase:'start', at:5, bg:'town', time:'dusk', cast:['rabbit','fenn'], lines:[
    ['_','After sunset, {n} slips into the Archive courtyard to return one of Nimbus’s overdue books. A voice drifts from the shadows.'],
    ['fenn','Returning a book? Or breaking in? In my experience it’s usually both.'],
    ['n','Returning! Obviously returning!'],
    ['fenn','Mm. Fenn, apprentice archivist. Day job: shelving. Night job: knowing things.'],
    ['fenn','I like trading. A riddle for a riddle. Answer mine, and I’ll tell you which shelf this book belongs on.'],
    ['fenn','I speak without a mouth, hear without ears, and come alive when the wind is kind. What am I?'],
    {fx:{met:'fenn'}},
    {c:[
      ['An echo.', {wit:2, aff:{fenn:8}}, [['fenn','…Well. Someone reads books.']]],
      ['A ghost.', {nerve:1, aff:{fenn:4}}, [['fenn','Wrong, but wrong with confidence. I respect that.']]],
      ['Your attitude.', {charm:1, aff:{fenn:5}}, [['fenn','Ha! That one goes in the collection.']]]
    ]}
  ]},

  /* ---------- festivals & milestones ---------- */
  ...[4,16,28].map(m => ({ id:'lantern_'+m, phase:'start', at:m, bg:'town', time:'dusk', cast:['rabbit'], lines:[
    ['_','Lantern Night. Paper lights bob along the river, and the whole of Clover Hollow smells like roasted chestnuts and candle wax.'],
    ['_','Who will {n} spend the evening with?'],
    ...companionLines('lantern')
  ]})),
  ...[8,20,32].map(m => ({ id:'snow_'+m, phase:'start', at:m, bg:'town', cast:['rabbit'], lines:[
    ['_','The Snow Festival has taken over the square. Snow sculptures line the lanes, and every window glows gold.'],
    ['_','Who will {n} spend the day with?'],
    ...companionLines('snow')
  ]})),
  { id:'harvest_6',  phase:'start', at:6,  bg:'pasture', cast:['rabbit','sheep'], lines: contestLines('Harvest Fair',0) },
  { id:'games_17',   phase:'start', at:17, bg:'pasture', cast:['rabbit','sheep'], lines: contestLines('Midsummer Games',1) },
  { id:'harvest_18', phase:'start', at:18, bg:'pasture', cast:['rabbit','sheep'], lines: contestLines('Harvest Fair',1) },
  { id:'games_29',   phase:'start', at:29, bg:'pasture', cast:['rabbit','sheep'], lines: contestLines('Midsummer Games',2) },
  { id:'harvest_30', phase:'start', at:30, bg:'pasture', cast:['rabbit','sheep'], lines: contestLines('Grand Harvest Fair',2) },
  { id:'bday_12', phase:'start', at:12, bg:'home', lines: birthdayLines(19) },
  { id:'bday_24', phase:'start', at:24, bg:'home', lines: birthdayLines(20) },

  /* ---------- Suzu ---------- */
  { id:'suzu_2', phase:'end', bg:'town', time:'dusk', cast:['rabbit','suzu'], when:S=>S.aff.suzu>=25&&S.m>=6, lines:[
    ['_','Suzu is still at her stall long after the other vendors have packed up. The crates behind her are still full.'],
    ['suzu','Don’t look at me like that. Business is… seasonal.'],
    ['n','You’ve been out here since dawn.'],
    ['suzu','Family stall. Three generations. If I can’t sell the apples, I’m the cat who ruined it. …That’s all.'],
    {c:[
      ['Help her sell the rest.', {charm:2, aff:{suzu:8}}, [['_','An hour later the crates are empty. Suzu doesn’t say thanks. She hands over the last apple, still warm from her pocket, which is very clearly thanks.']]],
      ['Tell her it isn’t her fault.', {kind:2, aff:{suzu:7}}, [['suzu','…I know that. Say it again later, when I’m not pretending to be fine.']]],
      ['Offer a better pitch.', {wit:2, aff:{suzu:6}}, [['suzu','“Apples with a story.” Hmph. That’s… annoyingly good.']]]
    ]}
  ]},
  { id:'suzu_heart', phase:'end', bg:'town', time:'dusk', cast:['rabbit','suzu'], when:S=>S.aff.suzu>=60&&S.m>=14, lines:[
    ['_','After closing, Suzu drags {n} to the top of the mill hill with a lantern and a very serious expression.'],
    ['suzu','I’m going to say something. Don’t laugh. I’m not good at this.'],
    ['suzu','When the three years end, I’m opening my own shop. And I thought maybe it should have two names on the sign.'],
    ['n','…Are you asking me to be your partner?'],
    ['suzu','I’m asking you not to leave me with a sign that only has one name on it. It would look ridiculous.'],
    {c:[
      ['Yes. Two names.', {aff:{suzu:10}, charm:1, flag:'heart_suzu'}, [['suzu','Done! Handshake. No, a hug. No, handshake! …Both.']]],
      ['Let me think. But I’m leaning yes.', {aff:{suzu:5}, flag:'heart_suzu'}, [['suzu','Fine. But I’m drafting the sign anyway.']]]
    ]}
  ]},

  /* ---------- Mugi ---------- */
  { id:'mugi_2', phase:'end', bg:'pasture', time:'dusk', cast:['rabbit','mugi'], when:S=>S.aff.mugi>=25&&S.m>=7, lines:[
    ['_','Rain clouds roll over the pasture. {n} reaches the barn just as the first fat drops fall, and finds Mugi already inside, kneading dough on an upturned crate.'],
    ['mugi','Don’t tell the farmhands. They think I’m checking the roof.'],
    ['n','You bake?'],
    ['mugi','Mum’s recipe. I’m better at it than I am at fences. …But the farm needs a farmer, not a baker.'],
    {c:[
      ['Say bread is a good thing to give the world.', {kind:2, aff:{mugi:8}, flag:'mugi_bake'}, [['mugi','…Huh. You say it like it’s a real job. Like it could be.']]],
      ['Say the farm needs happy people more than farmers.', {wit:1, aff:{mugi:7}}, [['mugi','That’s annoyingly wise. For a rabbit holding my dough.']]],
      ['Steal a bun.', {nerve:1, aff:{mugi:5}, stress:-3}, [['mugi','THAT was for the goats! …Fine. Take another. You’ve earned it.']]]
    ]}
  ]},
  { id:'mugi_heart', phase:'end', bg:'pasture', time:'dusk', cast:['rabbit','mugi'], when:S=>S.aff.mugi>=60&&S.m>=14, lines:[
    ['_','The fence is finally fixed. Mugi asks {n} to walk the whole length of it with him, slowly, as the sun turns orange.'],
    ['mugi','I made you something.'],
    ['_','He holds out a small wooden clover, carved with more care than any fence post has ever received.'],
    ['mugi','It’s not much. But the fence keeps the goats in, and I thought maybe I’d like to keep fixing it with you. For a long time. Whenever.'],
    {c:[
      ['Take the clover and hold his paw.', {aff:{mugi:10}, kind:1, flag:'heart_mugi'}, [['mugi','…Oh. Okay. That— yes. Good. Great. The goats will be thrilled.']]],
      ['Say it’s perfect, and ask for a little time.', {aff:{mugi:5}, flag:'heart_mugi'}, [['mugi','All the time you want. The fence isn’t going anywhere. …Well. It might fall down.']]]
    ]}
  ]},

  /* ---------- Gareth ---------- */
  { id:'gareth_2', phase:'end', bg:'town', time:'dusk', cast:['rabbit','gareth'], when:S=>S.aff.gareth>=25&&S.m>=8, lines:[
    ['_','A heavy hush hangs over the fountain square. Gareth sits on the rim, sword across his knees, staring at the cobblestones.'],
    ['gareth','Lost. To a veteran. In front of everyone. Three seconds.'],
    ['n','Three seconds is… fast?'],
    ['gareth','It’s the opposite of what I wanted it to be.'],
    {c:[
      ['Sit next to him in silence.', {kind:2, aff:{gareth:8}, flag:'gareth_soft'}, [['gareth','…Thanks. For not saying “it’s okay.” Everyone says that.']]],
      ['Offer to spar until he breaks the veteran’s record.', {nerve:2, str:1, aff:{gareth:7}, stress:4}, [['gareth','…You? Spar me? Ha. Hah! You’re on. Dawn. Bring water.']]],
      ['Remind him the dummy is still terrified of him.', {charm:1, aff:{gareth:6}}, [['gareth','…It does look nervous. Fine. Fine. I’m up.']]]
    ]}
  ]},
  { id:'gareth_heart', phase:'end', bg:'town', time:'dusk', cast:['rabbit','gareth'], when:S=>S.aff.gareth>=60&&S.m>=15, lines:[
    ['_','The Knight Trials are tomorrow. Gareth has asked {n} to the training yard at sunset, alone.'],
    ['gareth','I’m terrified. Not of the Trials. Of walking in and not having someone I want to look at afterward.'],
    ['gareth','Sit wherever. Wear whatever. But be there. That’s— I’m asking. I don’t ask.'],
    {c:[
      ['Promise to be in the front row.', {aff:{gareth:10}, nerve:1, flag:'heart_gareth'}, [['gareth','Front row. Right. I’ll win and look straight at you.']]],
      ['Promise, and tell him he’s already a knight to you.', {aff:{gareth:9}, kind:2, flag:'heart_gareth'}, [['gareth','…Don’t say things like that before a fight. I’ll cry in my helmet.']]]
    ]}
  ]},

  /* ---------- Fenn ---------- */
  { id:'fenn_2', phase:'end', bg:'town', time:'night', cast:['rabbit','fenn'], when:S=>S.aff.fenn>=25&&S.m>=9, lines:[
    ['_','The Archive lamps are out. Fenn is perched on the roof ridge with a lantern and an enormous ledger.'],
    ['fenn','Come up. Quietly. If anyone asks, we’re looking at stars. If anyone asks harder, we’re looking at stars.'],
    ['fenn','Want a secret? I’m not technically an apprentice. The seal on my papers is… a very good drawing.'],
    {c:[
      ['Promise to keep it a secret.', {nerve:1, aff:{fenn:8}, flag:'fenn_secret'}, [['fenn','…Good. I hoped you’d say that. I don’t usually hope.']]],
      ['Say he should tell the Head Archivist.', {kind:2, aff:{fenn:7}}, [['fenn','Honest and annoying. I’m keeping you.']]],
      ['Say it’s the best riddle he’s told.', {wit:2, aff:{fenn:6}}, [['fenn','It wasn’t a riddle. But I’ll take it.']]]
    ]}
  ]},
  { id:'fenn_heart', phase:'end', bg:'town', time:'dusk', cast:['rabbit','fenn'], when:S=>S.aff.fenn>=60&&S.m>=16, lines:[
    ['_','A folded slip of paper is tucked into {n}’s coat. A trail of riddles leads across town: shelf, bridge, fountain. The last answer is a name.'],
    ['_','The last answer is {n}’s.'],
    ['fenn','I don’t say true things plainly. It’s a bad habit. So: the answer to all of it is you. Questions, shelves, the roof. You.'],
    ['fenn','…That wasn’t a riddle. I’m aware. Say something before I climb the nearest tree.'],
    {c:[
      ['Say you solved it, and you’d like to keep solving it.', {wit:1, aff:{fenn:10}, flag:'heart_fenn'}, [['fenn','…Excellent. Unfair. Excellent.']]],
      ['Hug him. Briefly. Firmly.', {aff:{fenn:9}, flag:'heart_fenn'}, [['fenn','Oh. That’s— that’s an answer too. Noted. Underlined.']]]
    ]}
  ]},

  /* ---------- random life ---------- */
  { id:'r_coins', phase:'random', bg:'town', lines:[
    ['_','A glint in the gutter catches {n}’s eye. A small purse, dropped long ago, with a note: “Finders keepers. A friend of luck.”'],
    {fx:{coins:35}}
  ]},
  { id:'r_cold', phase:'random', bg:'home', cast:['rabbit','sheep'], when:S=>S.stress>=50, lines:[
    ['_','Achoo! {n} wakes with a stuffy nose and a very heavy head.'],
    ['sheep','Soup. Blanket. No arguments. Overworked rabbits are my least favorite kind.','hi'],
    {fx:{health:-8, stress:-6}}
  ]},
  { id:'r_scarf', phase:'random', bg:'home', cast:['rabbit','sheep'], lines:[
    ['sheep','I knitted something! It’s a scarf. Mostly. Part of it is a sleeve.','happy'],
    ['n','It’s perfect, Nimbus.'],
    {fx:{stress:-10, kind:1}}
  ]},
  { id:'r_lamb', phase:'random', bg:'pasture', cast:['rabbit'], lines:[
    ['_','A lost lamb bleats from the tall grass, tangled in a bramble.'],
    {c:[
      ['Free the lamb carefully.', {kind:3, str:1}, [['_','The lamb runs a happy little circle around {n}’s feet.']]],
      ['Fetch Mugi for help.', (S)=>S.met.mugi?{wit:1, aff:{mugi:3}}:{wit:1}, [['_','Between them they free the lamb. It seems unimpressed by both.']]],
      ['Walk on, you’re late.', {nerve:1, stress:-2}, [['_','{n} feels guilty for the next three hours.']]]
    ]}
  ]},
  { id:'r_merchant', phase:'random', bg:'town', cast:['rabbit'], lines:[
    ['_','A traveling merchant has set up a cart full of gadgets, tonics, and one suspicious parrot.'],
    {c:(S)=>{
      const o=[];
      if (S.coins>=50) o.push(['Buy a tonic (−50 coins)', {coins:-50, health:25, stress:-10}, [['_','It tastes like pepper and apples. It works.']]]);
      if (S.coins>=60) o.push(['Buy a rare book (−60 coins)', {coins:-60, wit:4}, [['_','The book is mostly diagrams, and the diagrams are enlightening.']]]);
      if (S.coins>=50) o.push(['Buy a charm bracelet (−50 coins)', {coins:-50, charm:4}, [['_','It jingles in a way that makes everyone smile.']]]);
      o.push(['Just browse.', {stress:-2}, [['_','The parrot says something rude about {n}’s ears. {n} laughs anyway.']]]);
      return o;
    }}
  ]},
  { id:'r_thunder', phase:'random', bg:'home', time:'night', cast:['rabbit','sheep'], lines:[
    ['_','A thunderstorm rattles the shutters. The lamp flickers, and flickers again.'],
    ['sheep','Cocoa? I have marshmallows. I have a lot of marshmallows.','happy'],
    {c:[
      ['Yes, please.', {stress:-15, kind:1}, [['_','They sit up late with warm mugs, listening to the rain, saying nothing important and everything that matters.']]],
      ['I’ll tough it out.', {nerve:2, stress:3}, [['sheep','Brave. Foolish. I’m leaving a mug outside your door anyway.','hi']]]
    ]}
  ]},
  { id:'r_goat', phase:'random', bg:'pasture', cast:['rabbit'], lines:[
    ['_','A goat in a flour-sack mask blocks the lane. “Toll,” it says, mostly in bleats. “Carrots.”'],
    {c:[
      ['Stand your ground.', null, (S)=> S.st.nerve>=25
        ? [{fx:{nerve:2}}, ['_','The goat stares. {n} stares harder. The goat blinks first and trots off, humiliated.']]
        : [{fx:{nerve:1, health:-4, stress:4}}, ['_','The goat headbutts {n} into a hedge. It is not sorry.']]],
      ['Pay the toll in carrots.', {coins:-10, kind:1}, [['_','The goat bows, politely, and leaves. It will be back.']]],
      ['Out-talk the goat.', null, (S)=> S.st.charm>=25
        ? [{fx:{charm:2, coins:15}}, ['_','The goat is so charmed it refunds its own toll. {n} is now richer, and slightly confused.']]
        : [{fx:{charm:1, stress:3}}, ['_','The goat listens, nods, and eats {n}’s hat anyway.']]]
    ]}
  ]},
  { id:'r_council', phase:'random', bg:'town', cast:['rabbit'], lines:[
    ['_','A notice on the town board: volunteers needed to repaint the old stone bridge.'],
    {c:[
      ['Volunteer a whole afternoon.', {kind:3, craft:2, stress:4, rep:1}, [['_','The bridge looks great. Several cats take credit.']]],
      ['Chip in for paint (−30 coins).', {coins:-30, rep:1, craft:1}, [['_','A tiny plaque will carry {n}’s name. Very tiny.']]],
      ['Maybe next time.', {stress:-2}, [['_','{n} reads the notice again, twice, and feels slightly worse each time.']]]
    ]}
  ]},
  { id:'r_letter', phase:'random', bg:'home', cast:['rabbit','sheep'], when:S=>S.m>=10, lines:[
    ['sheep','A letter came for you. From Grandma’s oldest friend in the capital.','happy'],
    ['_','It reads: “Your grandmother wrote about you often. Be brave and be kind. They are not opposites.”'],
    {fx:{kind:1, nerve:1, stress:-5}}
  ]}
];

/* ===== CLOVER HOLLOW : endings ===== */
const SHEEP_END = (t, pose) => ['sheep', t, pose || 'proud'];

const ENDINGS = {
  /* ---- love & partnership ---- */
  gareth_a: { title:'Shield Beside Shield', kind:'love', icon:'🛡️', bg:'town', cast:['rabbit','gareth','sheep'], hint:'Win Gareth’s heart with real strength and nerve.', lines:[
    ['_','{n} stands in the royal yard in dented training armor that suddenly isn’t for training anymore.'],
    ['gareth','Captain’s order: the new recruit stands next to mine. Don’t tell anyone it was my idea. …Everyone knows it was my idea.'],
    ['_','In later years, the people of Clover Hollow say the Lion and the Rabbit never lost a skirmish, because neither would let the other fall.'],
    SHEEP_END('I knitted them each a scarf. They wear them under the armor. That’s the real secret.') ]},
  gareth_b: { title:'The Captain’s Steady Hand', kind:'love', icon:'🩹', bg:'town', cast:['rabbit','gareth','sheep'], hint:'Win Gareth’s heart as the one who holds him up.', lines:[
    ['_','Gareth became Captain of the Royal Guard that spring. {n} never carried a sword into battle.'],
    ['_','{n} carried bandages, warm soup, and one strict rule: nobody leaves the infirmary before eating.'],
    ['gareth','The recruits are afraid of me. They’re MORE afraid of you. I couldn’t be prouder.'],
    SHEEP_END('Behind every great captain is an even greater rabbit with a ladle.') ]},
  fenn_a: { title:'Two Lamps in the Archive', kind:'love', icon:'🏮', bg:'town', time:'dusk', cast:['rabbit','fenn','sheep'], hint:'Be clever enough to keep up with Fenn.', lines:[
    ['_','The Archive’s night shift has two names on the roster now, and the Head Archivist has stopped asking why the lamps are always lit.'],
    ['fenn','We catalogued the forbidden section. Legally! It was reclassified as “mildly misfiled.”'],
    ['_','They solve riddles at dawn and trade questions at dusk, and every answer turns out to be the same one.'],
    SHEEP_END('I never understood a word of what they said to each other. I understood every minute of it.') ]},
  fenn_c: { title:'The Riddle-Thieves of Clover Hollow', kind:'love', icon:'🗝️', bg:'town', time:'night', cast:['rabbit','fenn','sheep'], secret:true, hint:'Win Fenn with daring instead of books.', lines:[
    ['_','Every few weeks, a wealthy merchant in the capital wakes to find his prized cheese replaced by a riddle.'],
    ['fenn','Our reputation precedes us. Also our riddles. They’re very good riddles.'],
    ['_','No one has ever caught them. Mostly because the guards are still trying to answer last spring’s riddle.'],
    SHEEP_END('They only steal things people were going to throw away. I checked. Mostly.','happy') ]},
  fenn_b: { title:'Fenn’s Last Riddle', kind:'love', icon:'☕', bg:'town', cast:['rabbit','fenn','sheep'], hint:'Win Fenn’s heart, however you do it.', lines:[
    ['_','{n} and Fenn open a little bookshop-café with a creaky sign: “Questions Welcome.”'],
    ['fenn','Customers ask what we sell. I say: answers. They read the menu. They’re disappointed. Then they come back.'],
    ['_','Every table has a riddle under the sugar bowl. Every riddle has the same answer, in small print.'],
    SHEEP_END('I get a free tea every Tuesday. It is the best arrangement of my life.') ]},
  mugi_a: { title:'The Bakery by the Fence', kind:'love', icon:'🥖', bg:'pasture', cast:['rabbit','mugi','sheep'], hint:'Win Mugi’s heart with a steady hand at a craft.', lines:[
    ['_','At the edge of the pasture sits a tiny bakery with a crooked chimney. It opens at dawn. The queue wraps around the goat pen.'],
    ['mugi','It was supposed to be a barn. Then someone said bread was a real job, and now look at us.'],
    ['_','{n} paints the signs. Mugi bakes. The goats eat anything that falls. It’s a perfect arrangement.'],
    SHEEP_END('I am contractually obligated to eat every bun they make. I take this very seriously.','happy') ]},
  mugi_b: { title:'A Very Long Fence', kind:'love', icon:'🌾', bg:'pasture', cast:['rabbit','mugi','sheep'], hint:'Win Mugi’s heart.', lines:[
    ['_','The fence still falls down about once a week. Mugi says it’s a feature. {n} keeps pretending to believe him.'],
    ['mugi','Every time it falls, we fix it together. I’ve decided that’s the point.'],
    ['_','Seasons pass. The pasture grows. Two names are carved on the gatepost, below a small, crooked clover.'],
    SHEEP_END('Some people want a castle. Some want a fence they can mend together. Both are fine.') ]},
  suzu_a: { title:'Suzu & {n}, General Goods', kind:'love', icon:'🏪', bg:'town', cast:['rabbit','suzu','sheep'], hint:'Become Suzu’s partner, with charm and a full coin purse.', lines:[
    ['_','The sign goes up in spring: SUZU & {N}, GENERAL GOODS. Beneath it, in tiny letters: “No refunds on apples.”'],
    ['suzu','We outsell the old stall by double. I hate how much I love it.'],
    ['_','They argue about prices every morning, share lunch every noon, and close the shop together every night.'],
    SHEEP_END('I told them rivals make the best partners. Suzu said she’s still winning. She isn’t.','happy') ]},
  suzu_b: { title:'The Rival Who Stayed', kind:'love', icon:'🍎', bg:'town', cast:['rabbit','suzu','sheep'], hint:'Become Suzu’s partner, in any way you can.', lines:[
    ['_','{n} and Suzu never quite agreed on who was winning. They never quite stopped competing, either.'],
    ['suzu','I’m only here because someone has to beat you at things. It’s a calling.'],
    ['_','Their little shop is small, loud, and completely theirs.'],
    SHEEP_END('The sign says “Suzu & {n}”. Both names are the same size. They measured.') ]},
  keeper: { title:'Keeper of the Clover Charter', kind:'secret', icon:'📜', bg:'town', cast:['rabbit','sheep'], secret:true, hint:'Collect all four Charter pieces and win the Hearing.', lines:[
    ['_','Years later, the Charter hangs framed in the Archive, four tiny clover petals stamped at its corners. Beneath it is a new line of ink: “Kept by {n}.”'],
    ['_','Every spring, the town gathers on the pasture and reads the first clause aloud, slowly, for the children.'],
    SHEEP_END('She would have called it about time. She would have been so proud she’d pretend not to be.') ]},
  everyone: { title:'The Whole Town Came', kind:'secret', icon:'🎉', bg:'town', cast:['rabbit','sheep','gareth','fenn','mugi','suzu'], secret:true, hint:'Be so kind that everyone becomes a close friend.', lines:[
    ['_','On the day {n} decides to stay, Clover Hollow rings every bell it owns.'],
    ['gareth','I brought a banner. It says WELCOME. It was going to say something longer, but I ran out of cloth.'],
    ['suzu','The apples are free today. I need everyone to forget I said that.'],
    ['mugi','And buns! So many buns!'],
    ['fenn','I made a riddle for the occasion. The answer is “home.” I’m told that’s too obvious.'],
    SHEEP_END('I promised your grandmother three years. She’d say I did it wrong, and that it was exactly right.') ]},

  /* ---- careers ---- */
  knight: { title:'Knight of the Hollow', kind:'career', icon:'⚔️', bg:'town', cast:['rabbit','sheep'], hint:'Reach 75 Strength and 50 Nerve.', lines:[
    ['_','{n} passes the Royal Trials with one clean stroke of the wooden sword Grandma left behind. The judges stand.'],
    ['_','Within a year, “the Rabbit of Clover Hollow” is a name whispered in barracks from the coast to the capital.'],
    SHEEP_END('I asked the judges to be gentle. They said they’d try. They did not try.','happy') ]},
  scholar: { title:'Grand Archivist', kind:'career', icon:'📜', bg:'town', cast:['rabbit','sheep'], hint:'Reach 75 Wit.', lines:[
    ['_','At twenty-one, {n} becomes the youngest Grand Archivist in the Royal Library’s history.'],
    ['_','Every scroll is cross-indexed. Every riddle in the building is solved. A great many lost cats are found.'],
    SHEEP_END('I still don’t understand half your footnotes. I read them all anyway.') ]},
  star: { title:'Star of the Spring Stage', kind:'career', icon:'🌟', bg:'town', cast:['rabbit','sheep'], hint:'Reach 75 Charm.', lines:[
    ['_','The curtain rises on the Royal Theater and the whole house falls quiet. Then they cheer.'],
    ['_','{n} dances, sings, bows, and does it all with the easy grace of someone who spent years practicing it badly.'],
    SHEEP_END('Row A, seat 1. I bring my own handkerchief.') ]},
  artisan: { title:'Master Artisan of the Hollow', kind:'career', icon:'🏺', bg:'home', cast:['rabbit','sheep'], hint:'Reach 75 Craft.', lines:[
    ['_','{n}’s workshop smells of fresh paint, cedar, and warm thread. People travel days to commission a single piece.'],
    ['_','On the wall hangs the first lopsided cushion {n} ever stitched, in a frame, with a small gold nameplate.'],
    SHEEP_END('That cushion has seen things. I keep it exactly where it is.') ]},
  healer: { title:'The Hollow’s Healer', kind:'career', icon:'🌿', bg:'pasture', cast:['rabbit','sheep'], hint:'Reach 75 Kindness.', lines:[
    ['_','There’s a small cottage at the edge of town with a green door that never locks. A lantern burns in the window all night.'],
    ['_','{n} treats colds, heartaches, and the occasional goat-related incident, and charges whatever people can afford.'],
    SHEEP_END('You’ve become the thing you were always going to become. I just kept the kettle warm.') ]},
  shadow: { title:'Guildmaster of Shadows', kind:'career', icon:'🌑', bg:'town', time:'night', cast:['rabbit','sheep'], secret:true, hint:'Reach 75 Nerve while staying under 40 Kindness.', lines:[
    ['_','The Night Market has a new name on its ledger, and everyone from here to the capital says it in a lowered voice.'],
    ['_','They say the Shadow Guild only steals things nobody was using. They say it with their fingers crossed.'],
    SHEEP_END('I have no idea what you do at night. I have decided that is for the best.','hi') ]},
  tycoon: { title:'The Merchant Prince', kind:'career', icon:'👑', bg:'town', cast:['rabbit','sheep'], secret:true, hint:'Save up 1,800 coins by the end.', lines:[
    ['_','By twenty-one, {n} owns the biggest stall in three kingdoms. Then the second-biggest. Then, briefly, a bridge.'],
    ['_','Coins roll in so reliably that the town hires a clerk just to hold the ledger upright.'],
    SHEEP_END('I told you the coin jar mattered. Look how that jar turned out.','happy') ]},
  hero: { title:'The Wandering Hero', kind:'career', icon:'🧭', bg:'pasture', cast:['rabbit','sheep'], hint:'Raise every stat to at least 40.', lines:[
    ['_','With a little of everything, {n} chooses the road. Not for running away, but for running toward.'],
    ['_','Villages call them Rabbit-of-All-Trades. They mend fences, win debates, break up goat fights, and leave before thanks.'],
    SHEEP_END('Write often. Come back for tea. The porch light will be on.') ]},
  mayor: { title:'Mayor of Clover Hollow', kind:'secret', icon:'🏛️', bg:'town', cast:['rabbit','sheep'], secret:true, hint:'Become the town’s pride: renown, charm, wit, and kindness all high.', lines:[
    ['_','At the Spring Festival, Clover Hollow votes. The count is closer than anyone expected, until it isn’t. It’s all {n}.'],
    ['_','The first act as mayor: fix the stone bridge. The second: ban display apples. (Suzu appeals. She loses.)'],
    SHEEP_END('Mayor. My lodger is the Mayor. I’m going to tell the entire town.','happy') ]},
  farmer: { title:'Pasture & Peace', kind:'career', icon:'🌻', bg:'pasture', cast:['rabbit','sheep'], hint:'Spend plenty of time working the pasture and gathering herbs.', lines:[
    ['_','{n} settles into a little farm on the sunny slope with a view of the fence and a very loud rooster.'],
    ['_','Mornings are early. Evenings are quiet. The sky in between is enormous.'],
    SHEEP_END('You always loved the grass. I’m not surprised. I’m delighted.','happy') ]},
  quiet: { title:'A Quiet, Good Life', kind:'career', icon:'🏡', bg:'home', cast:['rabbit','sheep'], hint:'Reach the end without any big specialty.', lines:[
    ['_','There is no trumpet fanfare, no royal summons. {n} has a small job, a good cup of tea, and a few dear friends.'],
    ['_','Some days are ordinary. {n} has learned that ordinary days are what a good life is made of.'],
    SHEEP_END('Whatever you chose, I’d have been proud. You chose well.') ]},

  /* ---- gentle bad endings ---- */
  frail: { title:'Rest, Please', kind:'bad', icon:'🩺', bg:'home', cast:['rabbit','sheep'], hint:'Don’t push yourself to collapse three times.', lines:[
    ['_','Nimbus carries {n} home for the third time and finally, firmly, closes the schedule book.'],
    ['sheep','No more plans. Not for a while. We’ll start with soup. Then sleep. Then we’ll see.','hi'],
    ['_','It takes a long season of rest. But {n} learns, slowly, that resting is also part of living.'] ]},
  ranaway: { title:'The Rabbit Who Ran', kind:'bad', icon:'🍃', bg:'pasture', cast:['rabbit','sheep'], hint:'Don’t let stress overwhelm you twice.', lines:[
    ['_','One morning, the guest room is empty. A note on the desk reads: “Gone to think. Back when I’m not afraid of my own schedule.”'],
    ['sheep','I’ll leave the lamp on. I always do.','hi'],
    ['_','Long walks, strange towns, a lot of sky. {n} comes back a year later, a little taller, and the lamp is still on.'] ]}
};
const ENDING_ORDER = ['gareth_a','gareth_b','fenn_a','fenn_c','fenn_b','mugi_a','mugi_b','suzu_a','suzu_b','everyone','keeper','mayor','tycoon','knight','scholar','star','artisan','healer','shadow','hero','farmer','quiet','frail','ranaway'];

/* ---------- confession scenes ---------- */
const CONFESS = {
  gareth: { bg:'town', time:'dusk', lines:[
    ['_','Gareth stands at the center of the square in full ceremonial tunic, in front of everyone.'],
    ['gareth','I passed the Trials. Captain’s second chair is mine. But there’s one thing I didn’t win alone.'],
    ['gareth','Stand with me, {n}. Not behind me. Beside me.']
  ], yes:'Take his paw. “Beside you.”', no:'“I need to find my own path first.”', noLine:['gareth','…Then I’ll be at the gate, waiting. Lions are patient. …Mostly.'] },
  fenn: { bg:'town', time:'dusk', lines:[
    ['_','Fenn slips a folded slip of paper into {n}’s paw. It’s his handwriting, careful and a little shaky.'],
    ['fenn','Riddle: what can’t be found by looking, but is always found by staying?'],
    ['fenn','Answer: you. I checked. Twice. Stay. In the one place I’ve never written a lie.']
  ], yes:'“I’ll stay.”', no:'“I need to find my own path first.”', noLine:['fenn','Then I’ll leave a light on at the Archive. I’m very good at waiting, in a book.'] },
  mugi: { bg:'pasture', time:'dusk', lines:[
    ['_','Mugi arrives still smelling of hay, with the wooden clover in both paws.'],
    ['mugi','I rehearsed this with the goats. They were unmoved. So I’ll just say it plainly.'],
    ['mugi','The fence is fixed. I want to keep fixing it with you. Please stay.']
  ], yes:'“Of course. I’ll stay.”', no:'“I need to find my own path first.”', noLine:['mugi','Okay. Okay! The fence will wait. It’s very good at waiting. …Not at standing, but at waiting.'] },
  suzu: { bg:'town', time:'dusk', lines:[
    ['_','Suzu slaps a deed onto the market table, hard enough to make the apples jump.'],
    ['suzu','Suzu & {n}, General Goods. I already ordered the sign. Don’t make me return the sign.'],
    ['suzu','I won’t say this twice. You’re my best friend and my best business decision.']
  ], yes:'“Partners.”', no:'“I need to find my own path first.”', noLine:['suzu','Fine! Go! …But the sign’s staying in the back room. With your name on it. Don’t read into it.'] }
};

/* ---------- mix & match: when you end with a partner, your career still shows up ---------- */
const CAREER_LINE = {
  knight:  'By day, {n} serves as a Knight of the Hollow, and the barracks have stopped arguing about the Rabbit.',
  scholar: 'By day, {n} works at the Royal Library, footnotes and all.',
  star:    'In the evenings, {n} is the toast of the Royal Theater, and always comes home for supper.',
  artisan: 'In the workshop, {n} makes pieces people travel for days to see.',
  healer:  'Between everything else, {n} tends the town’s aches and heartaches from a cottage with a green door.',
  shadow:  'By night, {n} still quietly runs the Night Market ledger. Nobody asks. Nobody tells.',
  tycoon:  '{n}’s stalls now span three kingdoms, and the ledger needs a clerk of its own.',
  hero:    'In between, {n} wanders the roads mending whatever is broken, and always comes home.',
  mayor:   'And {n} is, of course, Mayor of Clover Hollow, which makes town council meetings very interesting.',
  keeper:  '{n} also remains Keeper of the Charter, whose four clover petals hang framed in the Archive.',
  farmer:  '{n} still keeps a little farm on the sunny slope, with a very loud rooster.',
  quiet:   null
};

/* ===== CLOVER HOLLOW : main plot + more character events ===== */
const NPC = { brock: { name:'Steward Brock', icon:'🎩' } };

Object.assign(UPCOMING, {
  9:'a letter that has been waiting for you', 14:'someone with an offer', 21:'a second letter', 26:'a notice from the Crown', 30:'the Grand Harvest Fair, and a quiet conversation', 34:'the night before the Hearing'
});

function objectiveOf(S){
  const f = S.flags, n = PIDS.filter(p => f['piece_'+p]).length;
  if (S.m >= 35) return 'The Hearing is today.';
  if (f.notice2) return `Prepare for the Spring Hearing. Charter pieces: ${n}/4.`;
  if (f.letter1) return `Earn the trust of the four who hold Charter pieces (${n}/4).`;
  if (f.nimbus_plot) return 'Find the lost Charter. Learn what the Steward wants.';
  if (f.plot_notice) return 'Ask Nimbus what the Charter is.';
  return 'Settle into Clover Hollow.';
}
const PIECE_SPEECH = {
  gareth: 'By my oath as a Royal Guard recruit: this seal belonged to my grandfather, who witnessed the Charter. I was too young to hear it. I’m old enough to witness it now.',
  fenn:   'The Archive’s copy of the Fourth Clause, checked against three registers. It’s genuine. I’d stake my badge on it. …Which is, in a technical sense, a little forged. Moving on!',
  mugi:   'The boundary map. Every post of every fence in the pasture stands where this says. My family kept them honest for six generations. Just thought you should know.',
  suzu:   'Forty founders’ signatures. Merchants don’t sign anything for free. Trust me, I’ve been checking for years.'
};
const FATE_LINES = {
  saved:      'The Hearing ended in the town’s favor. The Charter stands, the lands remain Clover Hollow’s in common, and Steward Brock redrew his road along the river.',
  compromise: 'The Hearing ended in compromise: the road would follow the river, and the pasture’s lower field became a toll yard. Not everything was saved, but the heart of the Hollow was.',
  lost:       'The Hearing went against the Hollow. The Crown’s road cut across the lower pasture and the Archive annex came down. But the town carried on, stubborn as ever, and made the new road its own.'
};

// deeper hang-out scenes (unlock with affinity 40+)
HANGOUT.gareth.push(
  [['_','Gareth falls asleep on the bench mid-sentence. {n} spreads a coat over him and keeps watch.'],['gareth','…I wasn’t asleep. I was resting my eyes. Strategically.']],
  [['_','At the barracks gate, Gareth shows {n} a scar on his shoulder.'],['gareth','Fell off a roof at age nine. I told everyone it was a dragon. You’re the first I’m telling.']],
  [['_','They race to the fountain and back. Gareth lets {n} win, then pretends he didn’t.'],['gareth','Don’t look so smug. I was warming up. For losing.']]);
HANGOUT.fenn.push(
  [['_','Fenn shows {n} his secret nook in the rafters, full of stolen candle stubs and half-finished riddles.'],['fenn','Nobody knows this exists. Now, two people do. Don’t count out loud.']],
  [['_','Fenn reads aloud from a banned storybook, doing every voice.'],['fenn','The dragon’s voice is mine. Please never tell anyone I do dragons.']],
  [['_','Fenn walks {n} home through the lamplit lanes, talking about nothing.'],['fenn','This is the part where I say something clever. …I forgot it. That never happens.']]);
HANGOUT.mugi.push(
  [['_','Mugi teaches {n} to knead dough. Flour ends up on both noses.'],['mugi','Push. Fold. Turn. It’s like a conversation. I should get better at those, too.']],
  [['_','They sit on the fence at sunset, boots swinging.'],['mugi','When I was little I thought the sun lived behind the big hill. Part of me still does.']],
  [['_','Mugi carves a tiny wooden goat and hands it over, a little embarrassed.'],['mugi','It looks like a goat if you squint. Squint harder. Harder.']]);
HANGOUT.suzu.push(
  [['_','Suzu shows {n} the stall’s back room, stacked with unsold ideas.'],['suzu','Everything I wanted to sell and was too scared to try. Don’t laugh. …Okay, laugh a little.']],
  [['_','Suzu lets {n} hold her lucky bell for a minute.'],['suzu','It rings when I’m nervous. Don’t listen too closely.']],
  [['_','They stay up past midnight counting stars like coins.'],['suzu','Eighty-one. Eighty-two. …I lost count. I never lose count. You’re a bad influence.']]);

const brockSay = t => ['brock', t];

EVENTS.push(

/* ================= MAIN PLOT ================= */
{ id:'plot_notice', phase:'end', endAt:0, pri:0, bg:'town', cast:['rabbit'], lines:[
  ['_','Walking home after the first month, {n} stops at the town notice board. A crisp new sheet is pinned over the old ones.'],
  ['_','BY ORDER OF THE CROWN: a new trade road shall be surveyed through Clover Hollow. The Steward will assess all common lands. Objections must be filed with the Charter.'],
  ['n','…The Charter?'],
  ['_','Nobody nearby seems to know what that means. An old badger shrugs. A goose hisses. Everyone looks a little nervous.'],
  {fx:{flag:'plot_notice'}}
]},
{ id:'plot_nimbus', phase:'end', endAt:1, pri:0, bg:'home', time:'dusk', cast:['rabbit','sheep'], lines:[
  ['n','Nimbus, what is the Charter? Everyone at the market went quiet when I asked.'],
  ['sheep','Ah. I was hoping to tell you more gently. Your grandmother was the Keeper of the Clover Hollow Charter.','hi'],
  ['sheep','One parchment that says the pasture, the Archive, and the market square belong to the town, in common, forever. Without it, the Crown can call it “unclaimed land” and build a road straight over it.'],
  ['sheep','It vanished the winter she died. I’ve looked everywhere.'],
  ['n','So that’s why the Steward…'],
  ['sheep','Yes. We have three years before the survey is final. That’s why I really asked you to stay. I should have said so on the first night.'],
  (S) => [['_', ({
    watch:'On the back of Grandma’s pocket watch, in tiny letters: “Four petals make a clover.”',
    sword:'Carved into the hilt of the wooden sword, in tiny letters: “Four petals make a clover.”',
    ribbon:'Stitched inside the hem of the ear ribbon, in tiny thread: “Four petals make a clover.”',
    brush:'Burned into the brush handle, in tiny letters: “Four petals make a clover.”',
    clover:'On the back of the charm, in tiny letters: “Four petals make a clover.”' })[S.keep] ],
    ['n','Nimbus… do you know what this means?'],
    ['sheep','No. She never told me. She said some things are only understood by the one who needs them.']],
  {c:[
    ['“I’ll help. However I can.”', {nerve:1, kind:1}, [['sheep','Then we begin tomorrow. With tea.','happy']]],
    ['“Why didn’t you tell me sooner?”', {wit:1}, [['sheep','Because I was afraid you’d leave. …There. I said it.','hi']]],
    ['“A parchment? That’s all?”', {wit:1}, [['sheep','It’s all anything is, until someone believes in it.']]]
  ]},
  {fx:{flag:'nimbus_plot'}}
]},
{ id:'plot_brock', phase:'end', endAt:6, pri:0, bg:'town', time:'dusk', cast:['rabbit'], lines:[
  ['_','As the Harvest Fair winds down, a grey carriage rolls into the square. A stout badger in a tailored coat steps out with a ledger already open.'],
  brockSay('Good evening, Clover Hollow. Steward Brock, on the Crown’s business. Please don’t mind me. I’m only here to measure things.'),
  ['_','He measures the fountain. The fountain does not enjoy it.'],
  brockSay('You’d be the late Keeper’s grandchild. I’m sorry for your loss. I mean that. …Do you happen to know where the Charter is?'),
  {c:[
    ['“No. But I’ll find it.”', {nerve:2}, [brockSay('Admirable. Then I’ll see you at the Hearing, if one is called.')]],
    ['“Why do you want it?”', {wit:1}, [brockSay('I don’t. I want it not to exist. Which is different, and considerably tidier.')]],
    ['Smile politely and say nothing.', {charm:1}, [brockSay('Excellent manners. You’ll go far. Possibly in the wrong direction.')]]
  ]},
  {fx:{flag:'met_brock'}}
]},
{ id:'plot_letter1', phase:'start', at:9, bg:'home', time:'night', cast:['rabbit','sheep'], lines:[
  ['sheep','This was inside the old teapot. I found it looking for matches. It’s addressed to you. In her handwriting.','hi'],
  ['_','The paper smells faintly of mint and woodsmoke.'],
  ['_','“Dear clover, if you’re reading this, Nimbus has told you about the Charter, and I’m sorry to leave you such a heavy gift. I split it into four pieces so no single thief could carry it off. Four petals make a clover.”'],
  ['_','“Each piece is kept by someone who doesn’t yet know what they hold. You’ll know them by their hands: one that guards, one that reads, one that tends, one that trades.”'],
  ['sheep','A guard, a reader, a farmer, a merchant. …In a town this size, that narrows it down.'],
  ['sheep','But they’ll only hand it over to someone they trust. Not a stranger. Not a favor. A friend.'],
  ['n','Four petals. Four friends.'],
  {fx:{flag:'letter1', stress:-5}}
]},
{ id:'plot_brock2', phase:'end', endAt:14, pri:0, bg:'town', cast:['rabbit'], lines:[
  ['_','At the market, Steward Brock steps out from behind a pyramid of turnips, as though he’s been waiting there.'],
  brockSay('A moment, if I may. I’m told you’re clever. The Crown rewards clever.'),
  brockSay('A clerkship in the survey office. Two hundred and fifty coins today, and a house in the new Road Town. All I ask: tell me when the Charter surfaces.'),
  {c:[
    ['Refuse.', {nerve:2, kind:1, rep:1}, [brockSay('Pity. Principle is very expensive.'), ['_','Brock tips his hat and walks away. The turnips seem relieved.']]],
    ['Take the coins. (You’ll think of something.)', {coins:250, kind:-3, nerve:1, flag:'brock_deal'}, [['_','The coins feel heavier than they should.']]],
    ['Ask why he’s doing this.', {wit:2, flag:'brock_asked'}, [brockSay('Because someone must. Ask me again when the leaves turn, Keeper.')]]
  ]}
]},
{ id:'plot_letter2', phase:'start', at:21, bg:'home', time:'night', cast:['rabbit','sheep'], lines:[
  ['sheep','Another one. Under the floorboard by the kettle. Honestly, that woman hid mail like squirrels hide nuts.','hi'],
  ['_','“Dear clover, by now you’ve met them. I hope they’ve been kind. If four hands bring four pieces, the Charter will stand before any Steward. But a piece is only parchment. What wins a Hearing is a Keeper the town believes in. Be one.”'],
  ['_','“Whatever life you choose, know this: I was never afraid for you. I was afraid for the town. You are the first thing I ever trusted more than the Charter.”'],
  ['sheep','…She never wrote me a letter like that. That cranky old rabbit.'],
  (S) => S.flags.brock_deal ? [['sheep','…And {n}? About the Steward’s coins. I won’t lecture. But it isn’t too late to be the Keeper she meant.','hi']] : [],
  {fx:{stress:-5, kind:1}}
]},
{ id:'plot_notice2', phase:'end', endAt:26, pri:0, bg:'town', cast:['rabbit','sheep'], lines:[
  ['_','A new notice, bolder than the last: THE HEARING ON CLOVER HOLLOW’S LANDS WILL BE HELD AT THE SPRING FESTIVAL. THE KEEPER OR THE KEEPER’S HEIR MUST APPEAR WITH THE CHARTER.'],
  ['sheep','Nine months. Pieces, friends, and a speech. That’s all we need.','hi'],
  (S) => { const n = PIDS.filter(p=>S.flags['piece_'+p]).length;
    return [['sheep', n===4 ? 'And you already hold all four petals. Look at you, Keeper.' : n===0 ? 'And no petals in hand yet. Go and see your friends. Properly. Often.' : `And you hold ${n} of the four petals already. Good. Keep going.`, n===4?'proud':'happy']]; },
  {fx:{flag:'notice2', stress:3}}
]},
{ id:'plot_brock3', phase:'end', endAt:30, pri:0, bg:'town', time:'dusk', cast:['rabbit'], lines:[
  ['_','{n} finds the Steward sitting alone on the stone bridge, ledger closed, watching the river.'],
  brockSay('Your bridge is lovely. Someone repainted it. I wasn’t going to mention it. I’m mentioning it.'),
  brockSay('My home district is in the north. Two winters ago the harvest failed. A road through the Hollow would cut the grain route by nine days. Nine days, Keeper. Hungry people don’t have nine days.'),
  {c:[
    ['“Then build the road. Just not through the pasture.”', {wit:2, kind:1, flag:'brock_story'}, [brockSay('…Along the river? It would take longer to survey. It’s… not impossible.')]],
    ['“That gives you no right to erase us.”', {nerve:2}, [brockSay('No. It doesn’t. I know that, too. That’s the part that keeps me up.')]],
    ['“I’m sorry. I didn’t know.”', {kind:3, flag:'brock_story'}, [brockSay('Don’t be. It isn’t villainy. It’s arithmetic. But thank you.')]]
  ]},
  (S) => S.flags.brock_asked ? [{fx:{flag:'brock_story'}}] : []
]},
{ id:'plot_eve', phase:'end', endAt:34, pri:0, bg:'home', time:'night', cast:['rabbit','sheep'], lines:[
  ['sheep','Tomorrow. I’ve laid out your coat. I always lay out your coat.','hi'],
  (S) => { const n = PIDS.filter(p=>S.flags['piece_'+p]).length;
    return [['sheep', n===4 ? 'Four petals, four friends. She planned it so well, didn’t she?' : n>0 ? `${n} of the four, and a whole town behind you. It’s not a perfect hand. It never is.` : 'You don’t hold a single piece. But you hold something she didn’t know how to write down: every person in this town knows your name.']]; },
  ['sheep','What will you do tonight?'],
  {c:[
    ['Rehearse the speech.', {wit:2, charm:2, stress:3}, [['_','{n} practices in the mirror until the speech sounds like someone else’s, and then like their own.']]],
    ['Sleep. Really sleep.', {stress:-20, health:10}, [['sheep','Good. Wise. Tomorrow needs a rested rabbit.','happy']]],
    ['Walk the town once more.', {kind:2, nerve:2}, [['_','The lanterns are out. The fence is straight. The bridge glows in the moonlight. It’s worth it.']]]
  ]}
]},

/* ================= PIECES OF THE CHARTER ================= */
{ id:'gareth_piece', phase:'end', pri:2, bg:'town', time:'dusk', cast:['rabbit','gareth'], when:S=>S.flags.letter1&&S.aff.gareth>=50&&S.m>=10, lines:[
  ['_','Gareth is cleaning his grandfather’s old sword on the fountain’s rim, unusually quiet.'],
  ['gareth','The pommel’s been loose for years. Today it finally came off. Look.'],
  ['_','Inside the hollow pommel is a tiny brass seal and a scrap of parchment sewn with red thread. A single clover petal is drawn on it.'],
  ['gareth','Granddad never said a word. …It says “For the Keeper’s heir.” That’s you. Isn’t it.'],
  {c:[
    ['Ask if he’s sure about giving it up.', {kind:2, aff:{gareth:6}}, [['gareth','It was never mine. It’s been waiting for someone worth handing it to.']]],
    ['Promise to protect it with your life.', {nerve:1, aff:{gareth:5}}, [['gareth','Hm. That’s MY line.']]],
    ['Suggest he keep it safe until the Hearing.', {wit:2, aff:{gareth:5}}, [['gareth','…Smart. Right. I’ll guard it. It’s what I’m good at.']]]
  ]},
  ['_','One petal of the clover is found.'],
  {fx:{flag:'piece_gareth'}}
]},
{ id:'fenn_piece', phase:'end', pri:2, bg:'town', time:'night', cast:['rabbit','fenn'], when:S=>S.flags.letter1&&S.aff.fenn>=50&&S.m>=11, lines:[
  ['fenn','Come. Quietly. I found a page I wasn’t supposed to find.'],
  ['_','Behind the cover of a dusty register: a single page with the Archive’s seal and one hand-drawn clover petal.'],
  ['fenn','The official copy of the Fourth Clause. The one that says the Crown can’t override the Charter. I’m guessing that’s important.'],
  ['fenn','If I take it, the Head Archivist notices. If I leave it, it isn’t yours. If I copy it, I’m committing an illegal act in a perfectly legal building.'],
  {c:[
    ['Ask the Head Archivist openly.', {kind:2, aff:{fenn:5}, flag:'fenn_open'}, [['fenn','Openly. Honestly. Spare me. …Fine. Let’s go. I’ll hide behind you.'],['_','To everyone’s surprise, the old Archivist smiles. “Took you long enough, Keeper.” She’d known all along.']]],
    ['Copy it in secret tonight.', {nerve:2, aff:{fenn:7}}, [['fenn','Now you’re speaking my language. Bring ink.']]],
    ['Take the page and run.', {nerve:2, stress:3, aff:{fenn:3}}, [['fenn','…Bold. Foolish. I respect it deeply.']]]
  ]},
  ['_','Another petal of the clover is found.'],
  {fx:{flag:'piece_fenn'}}
]},
{ id:'mugi_piece', phase:'end', pri:2, bg:'pasture', cast:['rabbit','mugi'], when:S=>S.flags.letter1&&S.aff.mugi>=50&&S.m>=12, lines:[
  ['mugi','Mum made me promise not to touch the old bread basket. Says it’s older than the farm. But the lining’s coming loose.'],
  ['_','Under the frayed lining, folded flat: a hand-inked boundary map of the pasture, with four tiny clovers at the corners and one pressed petal.'],
  ['mugi','Those fence posts. All those years. I thought I was mending random fence. I’ve been walking the exact boundary of the Hollow.'],
  {c:[
    ['Help him fold it back carefully.', {craft:2, aff:{mugi:6}}, [['mugi','Gentle. Gentle. …You’re better at this than I am.']]],
    ['Tell him his family kept the town’s promise without knowing.', {kind:2, aff:{mugi:7}}, [['mugi','…Huh. I never thought of it like that. That’s a nice way to think about fences.']]],
    ['Tease him that the fence was always important.', {charm:1, aff:{mugi:5}}, [['mugi','I’ll make that into a sign. “Important Fence.”']]]
  ]},
  ['_','Another petal of the clover is found.'],
  {fx:{flag:'piece_mugi'}}
]},
{ id:'suzu_piece', phase:'end', pri:2, bg:'town', cast:['rabbit','suzu'], when:S=>S.flags.letter1&&S.aff.suzu>=50&&S.m>=13, lines:[
  ['suzu','I need a witness for something stupid. Don’t make a face.'],
  ['_','Suzu opens her family’s old ledger. Forty signatures in faded ink, a tiny gold clover petal pressed in the margin.'],
  ['suzu','Great-grandma wouldn’t let anyone touch it. Said it was “the family insurance.” I thought she meant money.'],
  ['suzu','If I hand it over, we lose our best sales tool. “Stall in business since the Founding” sells a lot of apples.'],
  {c:[
    ['Help her find a better story for the stall.', {wit:2, charm:1, aff:{suzu:6}}, [['suzu','A story. Hmph. I can sell a story. I can sell the story of the entire Hollow.']]],
    ['Say you’d never ask if it were only a favor.', {kind:2, aff:{suzu:7}}, [['suzu','It’s not a favor. That’s the problem. Fine. Take it. …Take care of it.']]],
    ['Bet her she can’t bear to lose.', {nerve:1, charm:1, aff:{suzu:5}}, [['suzu','A bet! You know me too well. Done. You buy dumplings for a year.']]]
  ]},
  ['_','The fourth petal of the clover is found.'],
  {fx:{flag:'piece_suzu'}}
]},

/* ================= EARLY FRIENDSHIP SCENES ================= */
{ id:'gareth_e1', phase:'end', pri:5, bg:'town', cast:['rabbit','gareth'], when:S=>S.aff.gareth>=12&&S.m>=5, lines:[
  ['_','{n} hears someone singing near the training dummy. Badly. Passionately.'],
  ['_','It’s Gareth. Alone. Singing a very off-key ballad to a very tolerant piece of straw.'],
  ['gareth','…How long have you been standing there?'],
  {c:[
    ['Join in the chorus.', {charm:2, aff:{gareth:7}}, [['gareth','Hah! Louder, then! The dummy deserves a duet!']]],
    ['Pretend you heard nothing.', {kind:1, aff:{gareth:5}}, [['gareth','…Thanks. A knight’s dignity depends on selective hearing.']]],
    ['Say the dummy deserves better.', {nerve:2, aff:{gareth:5}}, [['gareth','The dummy is TOUGH. It’s heard worse. From me.']]]
  ]}
]},
{ id:'fenn_e1', phase:'end', pri:5, bg:'town', cast:['rabbit','fenn'], when:S=>S.aff.fenn>=12&&S.m>=7, lines:[
  ['fenn','Mystery. Someone’s taken the Head Archivist’s best quill, and left a very rude drawing of a duck.'],
  ['fenn','I know it was one of three people: the baker’s boy, the ferryman, or the night guard. Which one draws ducks with that style?'],
  {c:[
    ['The ferryman. Ducks are his thing.', {wit:2, aff:{fenn:6}}, [['fenn','Right! The ferryman! His ducks always have eyebrows. Brilliant. Suspiciously brilliant.']]],
    ['The night guard. Look at the line pressure.', (S)=>S.st.wit>=25?{wit:2, aff:{fenn:8}}:{wit:1, aff:{fenn:4}}, (S)=> S.st.wit>=25
      ? [['fenn','Line pressure. Line PRESSURE! I knew I liked you.']]
      : [['fenn','Close. Wrong, but close. Keep reading.']]],
    ['Does it matter? The duck is hilarious.', {charm:1, aff:{fenn:5}}, [['fenn','…It is, isn’t it? We’ll frame it.']]]
  ]}
]},
{ id:'mugi_e1', phase:'end', pri:5, bg:'pasture', cast:['rabbit','mugi'], when:S=>S.aff.mugi>=12&&S.m>=5, lines:[
  ['_','A goat in a hat has escaped the pen again. This time it’s halfway down the lane, with Mugi in hot pursuit.'],
  ['mugi','{n}! Cut it off! Don’t let it reach the bakery!'],
  {c:[
    ['Block the lane with your arms.', {str:1, aff:{mugi:6}}, [['_','The goat stops. Stares. Sits down. Mugi nearly collapses with relief.']]],
    ['Offer it a carrot.', {wit:1, aff:{mugi:6}}, [['mugi','CARROT! Why didn’t I— that’s so— thank you.']]],
    ['Join the chase.', {nerve:1, stress:3, aff:{mugi:5}}, [['_','They chase the goat through three gardens and a flower stall. They lose. Gloriously.']]]
  ]}
]},
{ id:'suzu_e1', phase:'end', pri:5, bg:'town', cast:['rabbit','suzu'], when:S=>S.aff.suzu>=12&&S.m>=5, lines:[
  ['suzu','Sell-off. Today. Whoever sells more apples before sundown wins. Loser carries the winner’s crates for a week.'],
  ['suzu','Don’t look scared. I only win about eleven times out of ten.'],
  {c:[
    ['Use Charm: smile and sell.', null, (S)=> S.st.charm>=25 ? [{fx:{charm:2, coins:20, aff:{suzu:7}}}, ['suzu','…Nine apples sold in four minutes. How. How!']] : [{fx:{charm:1, aff:{suzu:5}}}, ['suzu','Ha! Good effort. I sold twelve. You carry the crates.']]],
    ['Use Wit: undercut the price.', {wit:2, coins:10, aff:{suzu:6}}, [['suzu','Undercutting! Unsportsmanlike! …Brilliant. Teach me.']]],
    ['Call it a tie and share the profit.', {kind:2, aff:{suzu:7}}, [['suzu','A tie. Hmph. Fine. A *profitable* tie.']]]
  ]}
]},

/* ================= TROUBLE (Steward pressure) ================= */
{ id:'gareth_trouble', phase:'end', pri:4, bg:'town', time:'dusk', cast:['rabbit','gareth'], when:S=>S.aff.gareth>=50&&S.m>=17&&S.done.plot_brock, lines:[
  ['_','Gareth is pacing outside the barracks with a sealed envelope.'],
  ['gareth','Steward Brock sent this. The Crown is offering me a Captaincy. A real one, ten years early. All I have to do is lead the guard escort for the Road survey.'],
  ['gareth','It’s everything I ever wanted. It’s also exactly the thing that would flatten the pasture.'],
  {c:[
    ['“Follow your heart, whatever it says.”', {kind:2, aff:{gareth:7}, flag:'gareth_loyal'}, [['gareth','My heart says what it said at the fountain. That I’d rather be a good lion than a fast Captain.']]],
    ['“The Hollow needs a lion more than the Crown does.”', {nerve:2, aff:{gareth:7}, flag:'gareth_loyal'}, [['gareth','…Heh. “Needs a lion.” I’m going to have that embroidered.']]],
    ['Say nothing. It’s his call.', {stress:3, aff:{gareth:-4}}, [['gareth','…Right. Of course. Silence is also an answer, isn’t it.'],['_','He doesn’t say it unkindly. That’s almost worse.']]]
  ]},
  (S) => S.flags.gareth_loyal ? [['_','Gareth writes back that night. The reply begins: “Dear Steward, no. Respectfully, with a very sharp sword.”']] : [['_','Gareth folds the envelope and puts it in his pocket. He doesn’t throw it away.']]
]},
{ id:'fenn_trouble', phase:'end', pri:4, bg:'town', time:'night', cast:['rabbit','fenn'], when:S=>S.aff.fenn>=50&&S.m>=18&&S.done.plot_brock, lines:[
  ['fenn','The Head Archivist called me in. Brock sent her a letter. It mentions “irregularities” in my apprenticeship papers.'],
  ['fenn','I thought I was careful. It turns out someone else is careful too, and has a deeper inkpot.'],
  {c:[
    ['Go with him to confess, together.', {kind:3, aff:{fenn:8}, flag:'fenn_cleared'}, [['_','The old Archivist listens to the whole confession without a word. Then she stamps his papers, a real stamp, and says: “Now it’s true.”']]],
    ['Argue the technicality.', null, (S)=> S.st.wit>=30
      ? [{fx:{wit:2, aff:{fenn:8}, flag:'fenn_cleared'}}, ['_','{n} cites three archive statutes and one very obscure proverb. The Archivist throws up her paws. “Fine! Fine. He stays.”']]
      : [{fx:{wit:1, aff:{fenn:4}}}, ['_','It almost works. The Archivist gives Fenn a month’s probation, and a look that could curdle milk.']]],
    ['Forge better papers together.', {nerve:2, kind:-2, aff:{fenn:7}, flag:'fenn_forged'}, [['fenn','Oh, I love this. I’m terrified. Let’s do it.']]]
  ]}
]},
{ id:'mugi_trouble', phase:'end', pri:4, bg:'pasture', cast:['rabbit','mugi'], when:S=>S.aff.mugi>=50&&S.m>=19&&S.done.plot_brock, lines:[
  ['_','At dawn, {n} finds Mugi standing in the pasture, ringed by red-ribboned survey stakes planted overnight.'],
  ['mugi','Forty-three stakes. I counted. Forty-three. In OUR pasture.'],
  ['_','He’s gripping one so tightly it creaks.'],
  {c:[
    ['Suggest removing them properly, with witnesses.', {wit:2, aff:{mugi:6}}, [['mugi','Witnesses. Right. Paperwork. I hate that you’re right.']]],
    ['Help him pull every single one up. Now.', {nerve:2, str:1, stress:4, rep:-1, aff:{mugi:7}}, [['mugi','…They’ll just put them back. But it felt good.']]],
    ['Sit with him until the anger passes.', {kind:2, aff:{mugi:8}}, [['_','They sit among the stakes until the sun is high and the anger has gone quiet.']]]
  ]}
]},
{ id:'suzu_trouble', phase:'end', pri:4, bg:'town', cast:['rabbit','suzu'], when:S=>S.aff.suzu>=50&&S.m>=18&&S.done.plot_brock, lines:[
  ['suzu','Brock’s people came to the stall. A toll-house contract: exclusive selling rights on the new road. Triple my family’s whole year.'],
  ['suzu','All they want is my family’s silence at the Hearing. Mum was already counting the coins. I said I’d think. I haven’t slept.'],
  {c:[
    ['Tell her what you’d do, and why.', {wit:1, kind:1, aff:{suzu:6}}, [['suzu','Hm. Honest. Annoyingly honest.']]],
    ['Tell her the Hollow is what makes the stall worth anything.', {charm:2, aff:{suzu:7}, flag:'suzu_loyal'}, [['suzu','…It does, doesn’t it. Apples taste better at home.']]],
    ['Say you’d understand if she took it.', {kind:2, aff:{suzu:8}, flag:'suzu_loyal'}, [['suzu','That’s the worst possible thing you could say. Because now I can’t.']]]
  ]}
]},

/* ================= PROMISE SCENES (late-game, deep bond) ================= */
{ id:'gareth_promise', phase:'end', pri:3, bg:'town', time:'dusk', cast:['rabbit','gareth'], when:S=>S.aff.gareth>=75&&S.m>=24, lines:[
  ['_','Dawn. The training yard is empty except for two shadows and a wooden sword.'],
  ['gareth','When I’m Captain, I’ll have one request I’m allowed to make to the Crown. One.'],
  ['gareth','I’m not going to use it on a bigger sword. Remember I said that.'],
  {c:[['“I’ll be waiting.”', {aff:{gareth:5}, flag:'promise_gareth'}, [['gareth','…Good. That’s all I needed to hear.']]], ['“You’d better hurry.”', {charm:1, aff:{gareth:5}, flag:'promise_gareth'}, [['gareth','Hah! Impatient. I like that.']]]]}
]},
{ id:'fenn_promise', phase:'end', pri:3, bg:'town', time:'night', cast:['rabbit','fenn'], when:S=>S.aff.fenn>=75&&S.m>=25, lines:[
  ['fenn','I stole something. For you. It’s the only thing I’ve ever stolen out of kindness.'],
  ['_','He presses a small iron key into {n}’s paw. It’s warm.'],
  ['fenn','Roof door of the Archive. Anyone can find the stars from there. No one finds me. But you can.'],
  {c:[['Keep it close.', {aff:{fenn:5}, flag:'promise_fenn'}, [['fenn','…Don’t lose it. I’d have to steal another. And I’m very attached.']]], ['Give him a clue back.', {wit:1, aff:{fenn:5}, flag:'promise_fenn'}, [['fenn','A riddle in return. How uncivilized. I love it.']]]]}
]},
{ id:'mugi_promise', phase:'end', pri:3, bg:'pasture', time:'dusk', cast:['rabbit','mugi'], when:S=>S.aff.mugi>=75&&S.m>=24, lines:[
  ['_','At the farthest corner of the pasture, Mugi has planted a patch of clover. Four-leaf, he swears. He counted.'],
  ['mugi','I thought, if everything changes, one corner of this place should stay the same. And it should have your name on it.'],
  {c:[['Kneel and help him water it.', {kind:2, aff:{mugi:5}, flag:'promise_mugi'}, [['mugi','…Perfect. That’s— perfect.']]], ['Say it’s the best gift you’ve ever gotten.', {charm:1, aff:{mugi:5}, flag:'promise_mugi'}, [['mugi','Mum is going to be insufferable about this.']]]]}
]},
{ id:'suzu_promise', phase:'end', pri:3, bg:'town', time:'dusk', cast:['rabbit','suzu'], when:S=>S.aff.suzu>=75&&S.m>=24, lines:[
  ['suzu','I drew the sign. Look. Don’t look. No, look.'],
  ['_','It’s a napkin sketch: a crooked shop, two names on the awning in equal letters, and a lopsided apple between them.'],
  {c:[['“It’s perfect. Print it.”', {aff:{suzu:5}, flag:'promise_suzu'}, [['suzu','Ha. Obviously. I’m only showing you because it’s perfect.']]], ['Add a tiny rabbit ear to the apple.', {craft:1, aff:{suzu:5}, flag:'promise_suzu'}, [['suzu','…It’s ridiculous. Leave it. Keep it. Don’t stop.']]]]}
]},

/* ================= GROUP & CROSS-CHARACTER SCENES ================= */
{ id:'gang_picnic', phase:'end', pri:5, bg:'pasture', cast:['rabbit',{id:'gareth',h:56},{id:'fenn',h:56},{id:'mugi',h:52},{id:'suzu',h:42}], when:S=>PIDS.every(p=>S.met[p]&&S.aff[p]>=10)&&S.m>=8, lines:[
  ['suzu','I organized a picnic. I call it a networking opportunity. Everyone else calls it lunch.'],
  ['gareth','Who’s guarding the sandwiches? I volunteer. I’m very good at guarding.'],
  ['fenn','I brought a riddle.'],['suzu','Nobody wants it.'],['mugi','I brought bread. Eat the bread.'],
  ['_','By the afternoon, they’ve invented a card game with six rules and no winner. No one is sure who’s cheating. Everyone is.'],
  {c:[
    ['Sit next to Gareth.', {aff:{gareth:5}, stress:-8}, [['gareth','…The best seat. I’ve guarded it.']]],
    ['Sit next to Fenn.', {aff:{fenn:5}, stress:-8}, [['fenn','Statistically, you chose correctly.']]],
    ['Sit next to Mugi.', {aff:{mugi:5}, stress:-8}, [['mugi','Careful, that’s the crumb side.']]],
    ['Sit next to Suzu.', {aff:{suzu:5}, stress:-8}, [['suzu','Don’t say it. I know. I have great taste in neighbors.']]],
    ['Sit in the middle and talk to everyone.', {charm:2, kind:1, stress:-8, aff:{gareth:2,fenn:2,mugi:2,suzu:2}}, [['_','It’s a good afternoon. The kind you remember when you’re old.']]]
  ]}
]},
{ id:'rivals_gf', phase:'end', pri:5, bg:'town', cast:['rabbit','gareth','fenn'], when:S=>S.aff.gareth>=30&&S.aff.fenn>=30&&S.m>=12, lines:[
  ['gareth','He keeps calling me “Sir Pommel.”'],
  ['fenn','It’s a compliment. Pommels are structural. They keep the sword together.'],
  ['gareth','It’s not a compliment! It’s a— it’s a piece of a sword!'],
  ['_','{n} is standing between two people who both appear to be enjoying this a little too much.'],
  {c:[
    ['Side with Gareth.', {aff:{gareth:5, fenn:-2}}, [['gareth','Thank you! A person of reason!'],['fenn','Traitor. I’ll remember this. In a footnote.']]],
    ['Side with Fenn.', {aff:{fenn:5, gareth:-2}}, [['fenn','Finally! Someone with taste!'],['gareth','I hate that this is happening.']]],
    ['Challenge them to race to the bridge.', {nerve:1, str:1, aff:{gareth:3, fenn:3}}, [['_','Fenn wins by cheating. Gareth wins by being stubborn. Both claim victory. Both are wrong.']]],
    ['Tell them they’re both being ridiculous.', {wit:1, aff:{gareth:2, fenn:2}}, [['gareth','…Fair.'],['fenn','…Annoyingly fair.']]]
  ]}
]},
{ id:'jealous', phase:'end', pri:4, bg:'town', time:'dusk', when:S=>PIDS.filter(p=>S.aff[p]>=55).length>=2&&S.m>=20, lines:[
  (S) => {
    const two = PIDS.filter(p=>S.aff[p]>=55).sort((a,b)=>S.aff[b]-S.aff[a]).slice(0,2);
    if (two.length < 2) return [];
    const A = two[0], B = two[1];
    const pa = PEOPLE[A], pb = PEOPLE[B];
    return [
      {cast:['rabbit',A,B]},
      ['_','Two knocks at the door at once, and two very different smiles on the step.'],
      [A, 'I was just passing by. Intentionally.'],
      [B, 'I was passing by too. Unintentionally. By coincidence. Completely coincidentally.'],
      ['_','They both look at {n}. Neither is willing to be the one who leaves first.'],
      {c:[
        [`Go for a walk with ${pa.name}.`, {aff:{[A]:6, [B]:-3}}, [[A,'…Right. Good. Let’s go.'],[B,'Fine. Fine! I wasn’t going to say anything. I’m saying something with my face.']]],
        [`Go for a walk with ${pb.name}.`, {aff:{[B]:6, [A]:-3}}, [[B,'…Really? Good. Yes. Let’s.'],[A,'Fine. Totally fine. I’ll just stand here, being fine.']]],
        ['Invite them both for tea.', {kind:2, charm:1, aff:{[A]:2, [B]:2}}, [['_','Tea is extremely awkward. Tea is also oddly sweet. Nimbus watches from the corner with a very knowing look.']]]
      ]}
    ];
  }
]},

/* ================= NIMBUS ================= */
{ id:'nimbus_past', phase:'end', pri:4, bg:'home', time:'dusk', cast:['rabbit','sheep'], when:S=>S.m>=10, lines:[
  ['sheep','Did I ever tell you how your grandmother and I met? We were twelve, at the Midsummer Games.','happy'],
  ['sheep','She was the smallest rabbit in the arm-wrestling. I was the largest sheep in the audience. She beat three lions in a row.'],
  ['sheep','I was so impressed that I tripped, fell face-first into the punch bowl, and she was the one who fished me out.'],
  ['n','Nimbus!'],
  ['sheep','I told you she was cranky. I never said she wasn’t kind.'],
  {c:[
    ['Ask what Grandma was like when she was young.', {kind:1}, [['sheep','Fearless. Loud. Tiny. She’d have loved how you’ve grown.']]],
    ['Ask if Nimbus loved her.', {charm:1}, [['sheep','Every day. In the way that doesn’t fit in a word.']]],
    ['Ask for the punch-bowl story again.', {stress:-6}, [['_','Nimbus tells it again. The punch bowl gets bigger every time.']]]
  ]}
]},
{ id:'nimbus_fear', phase:'end', pri:4, bg:'home', time:'night', cast:['rabbit','sheep'], when:S=>S.m>=26, lines:[
  ['sheep','Don’t tell the neighbors, but I’ve been hiding the guest-room key since February. I didn’t want to hand it over.','hi'],
  ['sheep','A house gets very quiet, {n}. I know it’s right for you to go. I do. I’m only saying it aloud so it gets smaller.'],
  {c:[
    ['Promise to visit every season.', {kind:2, stress:-6, flag:'nimbus_promise'}, [['sheep','…Tea. I’ll buy more tea. A great deal of tea.','happy']]],
    ['Say the guest room is yours forever.', {kind:1, charm:1, stress:-6}, [['sheep','You’ll make an old sheep cry into a teapot.']]],
    ['Say you may not go anywhere at all.', {kind:1, stress:-4}, [['sheep','Don’t say that unless you mean it. I’ll hold you to it. Gently. With cake.']]]
  ]}
]}

);

