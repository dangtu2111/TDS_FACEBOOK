// constants.ts

// Button follow
export const Button_add = "/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div/div/div[1]/div[2]/div/div/div/div[4]/div/div/div[3]/div/div/div/div[2]";
export const Button_follow = '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div/div/div[1]/div[2]/div/div/div[1]/div[4]/div/div/div[2]/div/div/div';

// Button like
export const Button_like = [
    '/html/body/div[1]/div/div[1]/div/div[5]/div/div/div[2]/div/div/div/div/div/div/div/div[2]/div[2]/div/div/div/div/div/div/div/div/div/div/div/div/div[13]/div/div/div[4]/div/div/div[1]/div/div[2]/div/div[1]/div[1]',
    '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div/div/div[2]/div/div/div[1]/div/div/div[2]/div[2]/div/div[1]/span/div/div/span/div[1]/div',
    '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[2]/div/div/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div/div[1]/div/div[1]',
    '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div/div[2]/div/div/div/div[1]/div[2]/div/div[2]/div/div[1]/div[1]',
    '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div[2]/div/div[2]/div[1]/div[3]/div/div/div/div/div[1]/div/div[1]'
];

export const targetSelectors = [
    `.x1i10hfl.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xdl72j9.x2lah0s.xe8uvvx.xdj266r.xat24cr.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.x5hsz1j.x10e4vud.x1v7wizp.xif3mjy.x4hg4is.x1ypdohk.x78zum5.xw3qccf.xsgj6o6.x1n2onr6`,
        `.x1i10hfl.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x3nfvp2.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x5ve5x3`,
        `.x1i10hfl.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xdl72j9.x2lah0s.xe8uvvx.xdj266r.xat24cr.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.x5hsz1j.x10e4vud.x1v7wizp.xif3mjy.x4hg4is.x1ypdohk.x78zum5.xw3qccf.xsgj6o6.x1n2onr6.x5ve5x3`
        
];

export const regexGroupPost = /^https:\/\/www\.facebook\.com\/groups\/(\d+)\/posts\/(\d+)/;
export const regexUsernamePost = /^https:\/\/www\.facebook\.com\/[^\/]+\/posts\/[a-zA-Z0-9]+(?:[a-zA-Z0-9\-]+)?(?:#[a-zA-Z0-9\-]*)?$/;
export const regexPermalink = /^https:\/\/www\.facebook\.com\/permalink\.php\?story_fbid=([^&]+)&id=([^&]+)/;
