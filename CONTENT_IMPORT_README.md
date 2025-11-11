# תיעוד הרצת הייבוא לMongoDB

## סקירה כללית

הקבצים הבאים נוצרו כדי לייבא את קטלוג התכנים ל-MongoDB וליצור קישוריות דינמיות עבור שמירת התקדמות צפייה ורשימות שמורות של משתמשים.

## קבצים שנוצרו

### 1. Script הייבוא
- **📁 `scripts/import-content-to-mongodb.js`** - מבצע ייבוא של קטלוג התכנים ל-MongoDB

### 2. Schema ושירותים עבור תכנים שמורים
- **📄 `models/schemas/saved_content_schema.js`** - Schema עבור תכנים שמורים (liked/bookmarked/watchlist)
- **📄 `models/services/saved_content_service.js`** - שירותים לניהול תכנים שמורים
- **📄 `controllers/saved_content_controller.js`** - Controller עבור API של תכנים שמורים
- **📄 `routes/api/saved_content_routes.js`** - נתיבי API עבור תכנים שמורים

### 3. עדכונים לשרת
- **📄 `server.js`** - עודכן להכליל את נתיבי saved content

## הוראות הרצה

### שלב 1: הרצת הייבוא

```bash
# הרצת הייבוא מתיקיית הפרוייקט
node scripts/import-content-to-mongodb.js
```

### שלב 2: וידוא ההגדרות

וודא שקובץ `.env` מכיל את ההגדרות הנכונות:
```
MONGO_ADDRESS=mongodb://127.0.0.1:27017
MONGO_DB_NAME=netflix
SERVER_PORT=3000
```

### שלב 3: הפעלת השרת

```bash
# הפעלת השרת
npm start
```

## מה קורה בייבוא

1. **ייבוא קטלוג תכנים** - כל הסרטים והסדרות מ-`models/data.js` מיובאות ל-collection `content`
2. **יצירת Collections** - MongoDB יוצר את ה-collections הבאים:
   - `content` - קטלוג תכנים (מיובא)
   - `videosources` - מקורות וידאו (יווצר דינמית)
   - `watchprogresses` - התקדמות צפייה (יווצר דינמית) 
   - `savedcontents` - תכנים שמורים (יווצר דינמית)

## API Endpoints שנוצרו

### תכנים שמורים (Saved Content)

#### Toggle (הוספה/הסרה)
```
POST /api/saved-content/toggle
Body: {
  "contentId": 1,
  "profileId": 1,
  "type": "liked",
  "notes": ""
}
```

#### בדיקת סטטוס
```
GET /api/saved-content/check?contentId=1&profileId=1&type=liked
```

#### קבלת רשימה שמורה
```
GET /api/saved-content/liked?profileId=1&limit=10
GET /api/saved-content/watchlist?profileId=1&limit=10
GET /api/saved-content/bookmarked?profileId=1&limit=10
```

#### סטטיסטיקות
```
GET /api/saved-content/statistics?profileId=1
```

## השלמת היישום

### 1. עדכון Frontend

יש לעדכן את הקבצים הבאים כדי להשתמש ב-MongoDB במקום localStorage:

#### `view/feed/feed.js`
```javascript
// החלף את localStorage לחיצות Like ב-API calls:
async function toggleLike(contentId, profileId) {
    const response = await fetch('/api/saved-content/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contentId: contentId,
            profileId: profileId,
            type: 'liked'
        })
    });
    const result = await response.json();
    return result.saved;
}
```

#### `view/utils.js`
```javascript
// עדכון פונקציות לעבוד עם MongoDB API במקום localStorage
```

### 2. אוטומציה של Video Sources

כאשר משתמש מתחיל צפייה, יש להוסיף את ה-video source ל-MongoDB:

```javascript
// בעת טעינת וידאו - הוסף למסד הנתונים
async function ensureVideoSourceExists(contentId, episodeId, videoUrl, duration) {
    await fetch('/api/video/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contentId,
            episodeId,
            videoUrl,
            sourceType: 'google_cloud',
            duration,
            quality: '720p'
        })
    });
}
```

## מבנה הנתונים

### Content Collection
```javascript
{
  id: Number,
  name: String,
  year: Number,
  genres: [String],
  genre: String,
  likes: Number,
  type: "movie" | "series",
  image: String,
  created_at: Date,
  updated_at: Date
}
```

### Saved Content Collection
```javascript
{
  userId: String,
  profileId: Number,
  contentId: Number,
  savedAt: Date,
  type: "liked" | "bookmarked" | "watchlist",
  notes: String
}
```

### Video Sources Collection
```javascript
{
  contentId: Number,
  episodeId: Number,
  videoUrl: String,
  sourceType: String,
  quality: String,
  duration: Number,
  thumbnailUrl: String,
  isActive: Boolean,
  metadata: Object
}
```

## בדיקת התקנה

לאחר הרצת הייבוא, בדוק ב-MongoDB:

```bash
# חיבור למונגו
mongo mongodb://127.0.0.1:27017/netflix

# בדיקת Collections
show collections

# בדיקת תכנים
db.content.count()
db.content.findOne()
```

## פתרון בעיות

### שגיאות חיבור
- וודא ש-MongoDB פועל
- בדוק הגדרות חיבור ב-`.env`

### שגיאות ייבוא
- בדוק logs של הרצת הייבוא
- וודא שאין duplicate IDs

### API לא עובד
- וודא שהשרת הופעל מחדש לאחר עדכון הנתיבים
- בדוק שהמשתמש מחובר (נדרש session)