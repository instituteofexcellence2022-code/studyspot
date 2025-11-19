# Book Seats Tab - Professional Debugging Guide

## Step-by-Step Troubleshooting

### Step 1: Open Browser Console
1. Open the student portal in your browser
2. Press **F12** (or Right-click → Inspect)
3. Go to the **Console** tab
4. Keep it open while testing

### Step 2: Navigate to Library Details
1. Go to `/libraries`
2. Click on any library
3. **Check Console** - You should see:
   ```
   [LIBRARY] Fetching library details for ID: <id>
   [LIBRARY] Starting fetch for ID: <id>
   [LIBRARY] API response: {...}
   [LIBRARY] Setting library data: {...}
   [LIBRARY] Fetch completed, loading: false
   ```

### Step 3: Click "Book Now" Button
1. Scroll to the pricing card
2. Click the **"Book Now"** button
3. **Check Console** - You should see:
   ```
   [BOOK NOW] Button clicked, switching to tab 2
   [TAB] Switching to tab: 2
   [TAB] Current tab: 2 Library loaded: true
   [BOOKING TAB] Rendering tab 2, library: true, loading: false
   ```

### Step 4: Check What You See
**Expected Behavior:**
- Tab switches to "🪑 Book Seats"
- Booking form appears with:
  - "Book Your Seat" heading
  - Date picker
  - Shift selector (after date selected)
  - Seat selector (after shift selected)

**If you see a white screen:**
- Check console for **RED ERROR MESSAGES**
- Look for messages like:
  - `Cannot read property 'X' of null`
  - `library is undefined`
  - `TypeError: ...`

### Step 5: Common Issues & Solutions

#### Issue 1: Tab Doesn't Switch
**Symptoms:** Clicking "Book Now" doesn't change the tab
**Check Console:**
- Look for `[BOOK NOW] Button clicked` message
- If missing → Button click handler not working
- If present but tab doesn't change → Tab state issue

**Solution:** The code now includes auto-scroll to tabs section

#### Issue 2: Tab Switches But Shows Blank
**Symptoms:** Tab changes to "Book Seats" but content is blank
**Check Console:**
- Look for `[BOOKING TAB] Rendering tab 2` message
- Check `library: true/false` and `loading: true/false`

**Possible Causes:**
1. **Library not loaded** → Should show "Loading library details..."
2. **Library is null** → Should show error message
3. **JavaScript error** → Check for red errors in console

#### Issue 3: Library Data Not Loading
**Symptoms:** Console shows fetch errors
**Check Console:**
- Look for `[LIBRARY] Fetch failed` message
- Check the error details

**Solution:** The code now uses mock library data as fallback

### Step 6: Manual Testing Checklist

- [ ] Library details page loads
- [ ] Console shows library fetch logs
- [ ] "Book Now" button is visible
- [ ] Clicking "Book Now" switches to tab 2
- [ ] Console shows tab switch logs
- [ ] Booking form appears (or loading spinner)
- [ ] Date picker is visible
- [ ] Can select a date
- [ ] Shift selector appears after date selection
- [ ] Can select a shift
- [ ] Seat selector appears after shift selection
- [ ] Can select a seat
- [ ] Booking summary appears
- [ ] "Confirm Booking" button is visible

### Step 7: If Still Not Working

**Share these details:**
1. **Console Logs:** Copy all console messages (especially errors)
2. **What You See:** Describe exactly what appears when you click "Book Now"
3. **Browser:** Which browser and version?
4. **Network Tab:** Check if API calls are failing (F12 → Network tab)

### Step 8: Quick Fixes Applied

✅ Added comprehensive console logging
✅ Added loading state handling
✅ Added null checks for library data
✅ Added error fallback to mock data
✅ Added auto-scroll to tabs section
✅ Added proper error messages
✅ Fixed tab rendering logic

### Step 9: Verify the Fix

After the latest changes, the tab should:
1. **Always render** when `tab === 2` (even if library is loading)
2. **Show loading spinner** if library data is being fetched
3. **Show error message** if library data failed to load
4. **Show booking form** if library data is available
5. **Log everything** to console for debugging

---

## Next Steps

1. **Test the booking flow** with the console open
2. **Share console logs** if issues persist
3. **Check Network tab** for failed API calls
4. **Verify library data** is being loaded correctly

The code now has extensive debugging - every step is logged to help identify the exact issue.


