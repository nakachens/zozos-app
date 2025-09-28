/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

// asset path helper function
const getAssetPath = (path) => {
  if (window.require) {
    try {
      const { remote, ipcRenderer } = window.require('electron');
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        return path; 
      } else {
        const pathModule = window.require('path');
        const appPath = remote ? remote.app.getAppPath() : process.resourcesPath;
        return pathModule.join(appPath, path.replace('./', ''));
      }
    } catch (error) {
      console.log('Electron modules not available, using web paths');
    }
  }

  return path;
};

// txt feelings here
const fileContents = {
  "zozo-message.txt": `WOAAHH NO WAYY YOU MADE IT HERE????

honestly i didnt think anyone would stick around to play with my project until the end but since youre here.. um h-hello..

this desktop took me WEEKS to perfect and i'm so happy you're exploring all the little details and easter eggs i put in.

every button click, every animation, every color choice was made with autumn september (not TOO autumn, but not not-autumn either..) vibes in mind. i wanted to create something that felt cozy and nostalgic, like finding an old computer!

the retro aesthetic mixed with modern functionality is something i'm really passionate about. i hope it brings you the same joy it brought me while creating it! (well.. i guess..)

thank you for taking the time to click around and discover all the hidden features. you're awesome! âœ¨

- zoha 
(also goes by zoe, zoza, zozo, zochan)`,

  "about-me.txt": `About Me (๑>؂•̀๑)

HIIIIII Im ZOE and im the creator of this autumn-themed desktop experience (づ ᴗ _ᴗ)づ♡

I love:
- PLAYING GAMES
- SLEEPING
- SLEEPING 2X
- BUILDING
- WORKING MYSELF TO THE BONE

This project combines all my favorite things - nostalgic UI design, warm color palettes, and the satisfaction of clicking through a well-designed interface.

I spent countless hours perfecting the border styles (cried a little bit too maybe), hover effects, and sound interactions to create something that feels both familiar and fresh.

Hope you enjoy exploring! (つ╥﹏╥)つ`,

  "what-i-learnt.txt": `What I Learned Building This Desktop (๑>؂•̀๑)!

Technical Skills:
- React component architecture (it was a good refresh!!)
- CSS styling and animations (oh this was HELL)
- Audio integration for UI sounds (not much of a challenge!)
- Responsive design principles (oh HELL)
- File system simulation (OH HELLLL EVEN THO I TOOK LOTS OF HELP FROM AI)

Design Insights:
- Color harmony in autumn palettes (this was super fun)
- Retro UI design patterns (SO FUN)
- User experience flow (VERY MUCH FUN and torturing)
- Interactive feedback importance (very much torturing AND FUN)
- Accessibility considerations (SO FUN)

Personal Growth:
- Patience with pixel-perfect details (pain.)
- Joy in small interactions (VERY FUN)
- Value of consistent theming (FUN)
- Pride in craftsmanship (VERY MUCH)

This project taught me that the magic is often in the details that users might not consciously notice but definitely feel AND THATS THE BEST PART ( ◡̀_◡́)ᕤ`,

  "pain.txt": ` things 2 cut off for my diet

- chocolates
- dark chocolates
- white chocolates
- pancakes
- anything with sugar
- rice 

 oh i aint gona survive..`,

  "pancake-recipe.txt": `protein pancakes recipe

Ingredients:
- flour
- vanilla essence thingy
- baking powder
- salt
- eggs
- milk
- very little butter
- protein powder

Instructions:
1. mix all dry ingredients in bowl
2. then add all wet ingredients
3. mix until smooth-ish
4. grease ur pan so it doesnt stick
5. pour VERY carefully in the pan n flip after EXACT 2 mins 
6. AND UR DONEEE

noted. saving for future use !

(im craving some with coffee now..)â˜•`,

  "hidden-secrets.txt": `Desktop Secrets & Easter Eggs hehe

OKAY SO did you find all of these yet? ദ്ദി ˉ͈̀꒳ˉ͈́ )✧

⋆˚꩜｡ Hidden Features:
- Right-click taskbar items for context menus
- Hover animations on desktop widgets  
- Sound effects on most interactions
- Different app window scaling behaviors
- Retro scanline effects in some apps

⋆˚꩜｡ Design Details:
- Every border uses the autumn color scheme
- Consistent 3D button styling throughout (i cried at this)
- Paper texture backgrounds in text apps
- Seasonal emoji usage everywhere (huhu)

⋆˚꩜｡ Audio Elements:
- Click sounds for buttons
- Card flip sounds in poetry app  
- Background music in music player
- Keyboard typing sounds in notebook (ITS SO SATISFYING)

theres more btw lets see what you find :P`
};

// folder 
function FolderApp({ folderType = "files", onOpenFile }) {
  const [selectedItem, setSelectedItem] = useState(null);
  
  const playClickSound = () => {
    const audio = new Audio(getAssetPath('/click.mp3'));
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const fileItems = [
    { name: "zozo-message.txt", icon: getAssetPath("./assets/txt.png"), type: "txt" },
    { name: "about-me.txt", icon: getAssetPath("./assets/txt.png"), type: "txt" },
    { name: "what-i-learnt.txt", icon: getAssetPath("./assets/txt.png"), type: "txt" },
    { name: "pain.txt", icon: getAssetPath("./assets/txt.png"), type: "txt" },
    { name: "pancake-recipe.txt", icon: getAssetPath("./assets/txt.png"), type: "txt" },
    { name: "hidden-secrets.txt", icon: getAssetPath("./assets/txt.png"), type: "txt" }
  ];

  // images files
  const imageItems = [
    { name: "progress-record-1", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "tictactoe-issue", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "my-friend-smiley", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "tictactoe-ugly-layout", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "me-planning-for-this-project", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "old-ugly-taskbar", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "cute-klein", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "cute-klein-2", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "rei", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "bro-scared-himself", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "i-hate-kaoru", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "kaoru", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "face-reveal", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "me-when-this-project", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "me-when-this-project-2", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "tehee", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "me-when-i", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "cute-akechi", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "nom-nom", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "when-i-went-out-in-months", icon: getAssetPath("./assets/img.png"), type: "image" },
    { name: "me-tryna-explain-this-project", icon: getAssetPath("./assets/img.png"), type: "image" }
  ];

  const items = folderType === "files" ? fileItems : imageItems;

  const handleDoubleClick = (item, index) => {
    playClickSound();
    if (onOpenFile) {
      onOpenFile(item, fileContents[item.name] || "");
    }
  };

  return (
    <div className="w-full h-full flex flex-col" 
         style={{ 
           background: 'linear-gradient(145deg, #f5deb3, #deb887)',
           fontFamily: 'Courier New, monospace'
         }}>
      
      {/* folder header*/}
      <div className="flex items-center justify-between p-4 border-b-2 border-amber-700">
        <div className="flex items-center space-x-2">
          <span className="text-lg">꩜</span>
          <h2 className="text-sm font-bold text-amber-900">
            {folderType === "files" ? "Text Files" : "Images"}
          </h2>
        </div>
        <span className="text-xs text-amber-700 font-bold">{items.length} items</span>
      </div>

      {/* files grid*/}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid gap-3" style={{ 
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gridAutoRows: 'minmax(100px, auto)'
        }}>
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-3 rounded border cursor-pointer transition-all duration-200 hover:transform hover:scale-105"
              style={{
                background: 'linear-gradient(145deg, #f9f6ef, #f0ecdc)',
                borderColor: selectedItem === index ? '#8b4513' : 'rgba(139, 69, 19, 0.2)',
                borderWidth: '1px',
                boxShadow: selectedItem === index ? '0 0 8px rgba(139, 69, 19, 0.3)' : 'none',
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => {
                playClickSound();
                setSelectedItem(index);
              }}
              onDoubleClick={() => handleDoubleClick(item, index)}
            >
              <div className="flex items-center justify-center mb-2" style={{ height: '32px', width: '32px' }}>
                {typeof item.icon === 'string' && item.icon.startsWith('/') ? (
                  <img 
                    src={item.icon} 
                    alt={item.name}
                    className="w-8 h-8 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <img 
                    src={item.icon} 
                    alt={item.name}
                    className="w-8 h-8 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                )}
                <span className="text-2xl hidden">{item.type === 'txt' ? '꩜' : '꩜'}</span>
              </div>
              <span className="text-xs text-center text-amber-900 font-bold break-words leading-tight">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* status */}
      <div className="flex justify-between items-center bg-amber-100 border-t-2 border-amber-700 px-4 py-2 text-xs text-amber-800">
        <span className="font-bold">{selectedItem !== null ? `Selected: ${items[selectedItem].name}` : 'No selection'}</span>
        <span className="font-bold">{folderType === "files" ? "Text Files" : "Images"}</span>
      </div>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { FolderApp, fileContents };