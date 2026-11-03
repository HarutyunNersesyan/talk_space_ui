# TalkSpace frontend

Այս տարբերակը օգտագործում է Connect → Accept → Chat հոսքը։ Ամբողջական բացատրությունը և երկու նախագծերի թարմացման հերթականությունը՝ CONNECT_ONLY_HY.md-ում։

## Էջեր

- Discover — հոբբիներով և մասնագիտություններով համադրում, լիարժեք պրոֆիլ, Connect և Block։
- Search people — ընդհանուր որոնում և հանրային պրոֆիլների քարտեր։
- Connections — հաստատված կապեր, ամբողջ պրոֆիլով incoming/sent հայտեր։
- Notifications — կապի ծանուցումներ և չկարդացվածների հաշվիչ։
- Messages — զրույցներ միայն ընդունված կապերով, private socket, կարդացվածի նշում և Block։
- Blocked people — սեփական սև ցուցակ և Unblock։

Պահպանված են գործող գունային լուծումները, քարտերի, sidebar-ի և չաթի տեսքը։ Հեռացված են Like-ի կոճակներն ու դրանց CSS կանոնները։

## Գործարկում

```bash
npm ci
npm start
```

.env-ում REACT_APP_API_URL=http://localhost:8080։ Frontend-ի հասցեն՝ http://localhost:3000՝ բեքենդի CORS/WebSocket origin-ին համապատասխան։

## Ստուգումներ

```bash
npx tsc --noEmit
npm test -- --watchAll=false --runInBand
npm run build
```

Frontend թեստերը ստուգում են կապերը, ամբողջ պրոֆիլի քարտերը, սև ցուցակը, ապաշրջափակումը, private chat-ը, չկարդացվածները, որոնումը և 429/503 պատասխանները։ Դրանցում API-ն և socket-ը մոդելավորված են։ Բեքենդի H2/HTTP ստուգումները ներառված են համապատասխան նախագծում։ Կենդանի PostgreSQL/Redis/Elasticsearch և բրաուզերի end-to-end փորձարկումը պետք է կատարել գործարկված երկու նախագծերով։

Կախվածությունների տարբերակները պահպանված են։ Build-ի չորս React Hook զգուշացումները վերաբերում են գործող Feedbacks.tsx, LocationPicker.tsx, Users.tsx և AdminDashboard.tsx ֆայլերին։
