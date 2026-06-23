function main(config) {
  const excludedNodeNamePattern = /剩余|流量|套餐|到期|更新|订阅|群组|重置|官网/;
  const filteredProxies = Array.isArray(config.proxies)
    ? config.proxies.filter(
        (proxy) =>
          proxy &&
          typeof proxy.name === "string" &&
          !excludedNodeNamePattern.test(proxy.name),
      )
    : [];
  const allNodes = filteredProxies.length
    ? filteredProxies
        .map((proxy) => proxy.name)
        .filter((name) => name && !["DIRECT", "REJECT", "直连", "拒绝"].includes(name))
    : [];
  const autoNodePattern = /新加坡|狮城|坡|sg|singapore|日本|东京|大阪|jp|japan/i;
  const dedupe = (items) => [...new Set(items.filter(Boolean))];
  const allNodeChoices = allNodes.length > 0 ? allNodes : ["直连"];
  const aiExcludedNodePattern = /香港|hk|hong kong/i;
  const aiNodeChoices = allNodes.filter((name) => !aiExcludedNodePattern.test(name));
  const lowMultiplierNodePattern = /(?:^|[^0-9])0\.\d+(?:x|倍)?(?:$|[^0-9])/i;
  const lowMultiplierNodeChoices = allNodes.filter((name) => lowMultiplierNodePattern.test(name));
  const autoNodeChoices = allNodes.filter(
    (name) => autoNodePattern.test(name) && !lowMultiplierNodePattern.test(name),
  );
  const fallbackAutoNodeChoices = allNodes.filter((name) => autoNodePattern.test(name));
  const lowMultiplierChoices = lowMultiplierNodeChoices.length > 0 ? lowMultiplierNodeChoices : allNodeChoices;
  const baseProxyChoices = ["直连", "拒绝", ...allNodeChoices];
  const manualChoices = dedupe(["自动", "低倍", ...baseProxyChoices]);
  const proxyFirstChoices = dedupe(["手动", "自动", "低倍", ...baseProxyChoices]);
  const aiProxyChoices = dedupe([
    "手动",
    "自动",
    "低倍",
    ...baseProxyChoices.slice(0, 2),
    ...(aiNodeChoices.length > 0 ? aiNodeChoices : allNodeChoices),
  ]);
  const directFirstChoices = dedupe(["直连", "自动", "低倍", ...baseProxyChoices]);

  config.proxies = [
    ...filteredProxies.filter((proxy) => !["直连", "拒绝"].includes(proxy.name)),
    { name: "直连", type: "direct" },
    { name: "拒绝", type: "reject" },
  ];

  config["proxy-groups"] = [
    {
      name: "自动",
      type: "url-test",
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50,
      proxies:
        autoNodeChoices.length > 0
          ? autoNodeChoices
          : fallbackAutoNodeChoices.length > 0
            ? fallbackAutoNodeChoices
            : allNodeChoices,
    },
    {
      name: "低倍",
      type: "url-test",
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50,
      proxies: lowMultiplierChoices,
    },
    {
      name: "手动",
      type: "select",
      proxies: manualChoices,
    },
    {
      name: "AI",
      type: "select",
      proxies: aiProxyChoices,
    },
    {
      name: "流媒",
      type: "select",
      proxies: proxyFirstChoices,
    },
    {
      name: "谷歌",
      type: "select",
      proxies: proxyFirstChoices,
    },
    {
      name: "TG",
      type: "select",
      proxies: proxyFirstChoices,
    },
    {
      name: "微软",
      type: "select",
      proxies: directFirstChoices,
    },
    {
      name: "国内",
      type: "select",
      proxies: directFirstChoices,
    },
    {
      name: "海外",
      type: "select",
      proxies: proxyFirstChoices,
    },
    {
      name: "漏网之鱼",
      type: "select",
      proxies: directFirstChoices,
    },
  ];

  config["rule-providers"] = {
    ...(config["rule-providers"] || {}),
    directRules: {
      type: "http",
      behavior: "classical",
      url: "https://raw.githubusercontent.com/wsq0102/config/master/direct.yaml",
      path: "./ruleset/direct.yaml",
      interval: 86400,
    },
    proxyRules: {
      type: "http",
      behavior: "classical",
      url: "https://raw.githubusercontent.com/wsq0102/config/master/proxy.yaml",
      path: "./ruleset/proxy.yaml",
      interval: 86400,
    },
  };

  config.dns = {
    enable: true,
    listen: "0.0.0.0:53",
    ipv6: false,
    "enhanced-mode": "fake-ip",
    nameserver: ["223.5.5.5", "114.114.114.114", "119.28.28.28"],
    fallback: ["223.6.6.6", "114.114.115.115"],
    "fake-ip-filter": [
      "*.lan",
      "*.local",
      "localhost",
      "time.*",
      "time.*.com",
      "ntp.*",
      "ntp.*.com",
    ],
  };

  config.rules = [
    "DOMAIN-SUFFIX,openai.com,AI",
    "DOMAIN-SUFFIX,chatgpt.com,AI",
    "DOMAIN-SUFFIX,oaistatic.com,AI",
    "DOMAIN-SUFFIX,oaiusercontent.com,AI",
    "DOMAIN-SUFFIX,ai.com,AI",
    "DOMAIN-SUFFIX,anthropic.com,AI",
    "DOMAIN-SUFFIX,claude.ai,AI",
    "DOMAIN-SUFFIX,perplexity.ai,AI",
    "DOMAIN-SUFFIX,poe.com,AI",
    "DOMAIN-SUFFIX,gemini.google.com,AI",
    "DOMAIN-KEYWORD,openai,AI",
    "DOMAIN-KEYWORD,chatgpt,AI",
    "DOMAIN-KEYWORD,claude,AI",
    "DOMAIN-KEYWORD,perplexity,AI",

    "DOMAIN-SUFFIX,netflix.com,流媒",
    "DOMAIN-SUFFIX,nflxvideo.net,流媒",
    "DOMAIN-SUFFIX,nflximg.net,流媒",
    "DOMAIN-SUFFIX,nflxso.net,流媒",
    "DOMAIN-SUFFIX,nflxext.com,流媒",
    "DOMAIN-SUFFIX,fast.com,流媒",
    "DOMAIN-SUFFIX,disneyplus.com,流媒",
    "DOMAIN-SUFFIX,disney-plus.net,流媒",
    "DOMAIN-SUFFIX,dssott.com,流媒",
    "DOMAIN-SUFFIX,bamgrid.com,流媒",
    "DOMAIN-SUFFIX,hotstar.com,流媒",
    "DOMAIN-SUFFIX,hotstarext.com,流媒",
    "DOMAIN-SUFFIX,hulu.com,流媒",
    "DOMAIN-SUFFIX,hbomax.com,流媒",
    "DOMAIN-SUFFIX,hbo.com,流媒",
    "DOMAIN-SUFFIX,max.com,流媒",
    "DOMAIN-SUFFIX,primevideo.com,流媒",
    "DOMAIN-SUFFIX,amazonvideo.com,流媒",
    "DOMAIN-SUFFIX,media-amazon.com,流媒",
    "DOMAIN-SUFFIX,music.amazon.com,流媒",
    "DOMAIN-SUFFIX,peacocktv.com,流媒",
    "DOMAIN-SUFFIX,paramountplus.com,流媒",
    "DOMAIN-SUFFIX,pplusstatic.com,流媒",
    "DOMAIN-SUFFIX,pluto.tv,流媒",
    "DOMAIN-SUFFIX,discoveryplus.com,流媒",
    "DOMAIN-SUFFIX,dplus-ph-ww.com,流媒",
    "DOMAIN-SUFFIX,dazn.com,流媒",
    "DOMAIN-SUFFIX,dazn-api.com,流媒",
    "DOMAIN-SUFFIX,mubi.com,流媒",
    "DOMAIN-SUFFIX,crave.ca,流媒",
    "DOMAIN-SUFFIX,tver.jp,流媒",
    "DOMAIN-SUFFIX,bbciplayer.com,流媒",
    "DOMAIN-KEYWORD,iplayer,流媒",
    "DOMAIN-SUFFIX,spotify.com,流媒",
    "DOMAIN-SUFFIX,scdn.co,流媒",
    "DOMAIN-SUFFIX,spotifycdn.com,流媒",
    "DOMAIN-SUFFIX,tidal.com,流媒",
    "DOMAIN-SUFFIX,soundcloud.com,流媒",
    "DOMAIN-SUFFIX,sndcdn.com,流媒",
    "DOMAIN-SUFFIX,deezer.com,流媒",
    "DOMAIN-SUFFIX,dzcdn.net,流媒",
    "DOMAIN-SUFFIX,pandora.com,流媒",
    "DOMAIN-SUFFIX,music.apple.com,流媒",
    "DOMAIN-SUFFIX,applemusic.com,流媒",
    "DOMAIN-SUFFIX,tubi.tv,流媒",
    "DOMAIN-SUFFIX,plex.tv,流媒",
    "DOMAIN-SUFFIX,viki.com,流媒",
    "DOMAIN-SUFFIX,viu.com,流媒",
    "DOMAIN-SUFFIX,crunchyroll.com,流媒",
    "DOMAIN-SUFFIX,abema.tv,流媒",
    "DOMAIN-SUFFIX,twitch.tv,流媒",
    "DOMAIN-SUFFIX,ttvnw.net,流媒",
    "DOMAIN-SUFFIX,nicochannel.jp,流媒",
    "DOMAIN-SUFFIX,nicovideo.jp,流媒",
    "DOMAIN-SUFFIX,tv.apple.com,流媒",
    "DOMAIN-SUFFIX,youtube.com,流媒",
    "DOMAIN-SUFFIX,googlevideo.com,流媒",
    "DOMAIN-SUFFIX,ytimg.com,流媒",
    "DOMAIN-SUFFIX,youtu.be,流媒",
    "DOMAIN-KEYWORD,youtube,流媒",
    "DOMAIN-KEYWORD,netflix,流媒",
    "DOMAIN-KEYWORD,disney,流媒",
    "DOMAIN-KEYWORD,hulu,流媒",
    "DOMAIN-KEYWORD,primevideo,流媒",
    "DOMAIN-KEYWORD,peacock,流媒",
    "DOMAIN-KEYWORD,paramount,流媒",
    "DOMAIN-KEYWORD,spotify,流媒",
    "DOMAIN-KEYWORD,crunchyroll,流媒",
    "DOMAIN-KEYWORD,netflixcdn,流媒",
    "DOMAIN-KEYWORD,discoveryplus,流媒",
    "DOMAIN-KEYWORD,dazn,流媒",
    "DOMAIN-KEYWORD,deezer,流媒",
    "DOMAIN-KEYWORD,pandora,流媒",
    "DOMAIN-KEYWORD,soundcloud,流媒",
    "DOMAIN-KEYWORD,applemusic,流媒",
    "DOMAIN-KEYWORD,twitch,流媒",

    "DOMAIN-SUFFIX,google.com,谷歌",
    "DOMAIN-SUFFIX,googleapis.com,谷歌",
    "DOMAIN-SUFFIX,gstatic.com,谷歌",
    "DOMAIN-SUFFIX,googleusercontent.com,谷歌",
    "DOMAIN-SUFFIX,ggpht.com,谷歌",
    "DOMAIN-SUFFIX,googlevideo.com,谷歌",
    "DOMAIN-SUFFIX,youtube.com,谷歌",
    "DOMAIN-SUFFIX,ytimg.com,谷歌",
    "DOMAIN-SUFFIX,youtu.be,谷歌",
    "DOMAIN-SUFFIX,appspot.com,谷歌",
    "DOMAIN-KEYWORD,google,谷歌",
    "DOMAIN-KEYWORD,youtube,谷歌",

    "DOMAIN-SUFFIX,telegram.org,TG",
    "DOMAIN-SUFFIX,t.me,TG",
    "DOMAIN-SUFFIX,tdesktop.com,TG",
    "DOMAIN-SUFFIX,telegra.ph,TG",
    "DOMAIN-SUFFIX,telesco.pe,TG",
    "IP-CIDR,91.108.4.0/22,TG,no-resolve",
    "IP-CIDR,91.108.8.0/22,TG,no-resolve",
    "IP-CIDR,91.108.12.0/22,TG,no-resolve",
    "IP-CIDR,91.108.16.0/22,TG,no-resolve",
    "IP-CIDR,91.108.56.0/22,TG,no-resolve",
    "IP-CIDR,149.154.160.0/20,TG,no-resolve",
    "IP-CIDR6,2001:67c:4e8::/48,TG,no-resolve",
    "IP-CIDR6,2001:b28:f23d::/48,TG,no-resolve",
    "IP-CIDR6,2001:b28:f23f::/48,TG,no-resolve",

    "DOMAIN-SUFFIX,microsoft.com,微软",
    "DOMAIN-SUFFIX,microsoftonline.com,微软",
    "DOMAIN-SUFFIX,live.com,微软",
    "DOMAIN-SUFFIX,office.com,微软",
    "DOMAIN-SUFFIX,office365.com,微软",
    "DOMAIN-SUFFIX,outlook.com,微软",
    "DOMAIN-SUFFIX,onedrive.com,微软",
    "DOMAIN-SUFFIX,sharepoint.com,微软",
    "DOMAIN-SUFFIX,windows.com,微软",
    "DOMAIN-SUFFIX,windows.net,微软",
    "DOMAIN-SUFFIX,msftconnecttest.com,微软",
    "DOMAIN-SUFFIX,msftncsi.com,微软",
    "DOMAIN-SUFFIX,bing.com,微软",
    "DOMAIN-SUFFIX,xboxlive.com,微软",
    "DOMAIN-KEYWORD,microsoft,微软",

    "DOMAIN,localhost,国内",
    "DOMAIN-SUFFIX,local,国内",
    "IP-CIDR,127.0.0.0/8,国内,no-resolve",
    "IP-CIDR,10.0.0.0/8,国内,no-resolve",
    "IP-CIDR,172.16.0.0/12,国内,no-resolve",
    "IP-CIDR,192.168.0.0/16,国内,no-resolve",
    "IP-CIDR,100.64.0.0/10,国内,no-resolve",
    "IP-CIDR,169.254.0.0/16,国内,no-resolve",
    "IP-CIDR6,::1/128,国内,no-resolve",
    "IP-CIDR6,fc00::/7,国内,no-resolve",
    "IP-CIDR6,fe80::/10,国内,no-resolve",
    "RULE-SET,directRules,国内",
    "RULE-SET,proxyRules,海外",
    "GEOSITE,CN,国内",
    "GEOIP,CN,国内",
    "GEOSITE,geolocation-!cn,海外",

    "MATCH,漏网之鱼",
  ];

  return config;
}
