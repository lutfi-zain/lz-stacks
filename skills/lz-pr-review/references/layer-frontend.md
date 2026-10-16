# Frontend & UI Layer Review Reference (`layer-frontend.md`)

**Discipline:** UI Rendering Performance, Bundle Size & State Reactivity  
**Canonical Sources:** React Core Docs ("You Might Not Need an Effect"), Vercel Core (`vercel-react-best-practices`), Web Vitals (Google Chrome Dev)  
**Prefix:** `fe-`

---

## Rule Catalog by Impact

### 1. Waterfalls & Asynchronous Efficiency (CRITICAL)

#### `fe-waterfall-async`
- **Impact:** CRITICAL
- **Why:** Sequential `await` calls in components or data loaders compound network latency, causing noticeable page loading lag.
- **Incorrect:**
  ```typescript
  // Takes T(user) + T(notifications) + T(settings)
  const user = await fetchUser(userId);
  const notifications = await fetchNotifications(userId);
  const settings = await fetchSettings(userId);
  ```
- **Correct:**
  ```typescript
  // Takes max(T(user), T(notifications), T(settings))
  const [user, notifications, settings] = await Promise.all([
    fetchUser(userId),
    fetchNotifications(userId),
    fetchSettings(userId)
  ]);
  ```
- **Remedy:** Parallelize independent async operations with `Promise.all()`.

---

### 2. State Reactivity & Re-render Cascades (HIGH)

#### `fe-rerender-context-split`
- **Impact:** HIGH
- **Why:** Storing rapidly changing state in the same Context Provider as static data causes every consumer to re-render whenever any value changes.
- **Incorrect:**
  ```tsx
  // Single context holding both user info and typing search query
  const AppContext = createContext({ user: null, searchQuery: '', setSearchQuery: () => {} });
  // Every component consuming user info re-renders on EVERY keystroke!
  ```
- **Correct:**
  ```tsx
  // Split into independent contexts
  const UserContext = createContext(null);
  const SearchQueryContext = createContext({ query: '', setQuery: () => {} });
  ```
- **Remedy:** Separate high-frequency state from low-frequency state into separate providers.

#### `fe-rerender-inline-literals`
- **Impact:** HIGH
- **Why:** Passing new object/array literals or inline arrow functions to `React.memo` components breaks shallow comparison and causes useless re-renders.
- **Incorrect:**
  ```tsx
  <MemoizedUserCard 
    style={{ marginTop: 10 }} 
    onClick={() => handleSelect(user.id)} 
  />
  ```
- **Correct:**
  ```tsx
  const cardStyle = { marginTop: 10 }; // Hoisted outside or useMemo
  const onSelect = useCallback(() => handleSelect(user.id), [user.id]);
  <MemoizedUserCard style={cardStyle} onClick={onSelect} />
  ```
- **Remedy:** Hoist static objects; stabilize callbacks with `useCallback` or pass IDs to child handlers.

#### `fe-derived-state-in-render`
- **Impact:** HIGH
- **Why:** Using `useEffect` to sync state derived from props causes an extra render cycle, layout flash, and potential infinite loops.
- **Incorrect:**
  ```tsx
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(`${firstName} ${lastName}`); // ❌ Extra render pass!
  }, [firstName, lastName]);
  ```
- **Correct:**
  ```tsx
  // ✅ Calculate directly during render (pure computation)
  const fullName = `${firstName} ${lastName}`;
  ```
- **Remedy:** Compute derived state synchronously during render.

---

### 3. Resource Lifecycle & Memory Leaks (HIGH)

#### `fe-memory-listener-cleanup`
- **Impact:** HIGH
- **Why:** Uncleaned global event listeners, timers, or WebSocket subscriptions in `useEffect` remain active after component unmount, leaking memory and causing setState warnings on unmounted components.
- **Incorrect:**
  ```tsx
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    const timer = setInterval(pollStatus, 5000);
    // ❌ Missing cleanup function!
  }, []);
  ```
- **Correct:**
  ```tsx
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    const timer = setInterval(pollStatus, 5000);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
    };
  }, []);
  ```
- **Remedy:** Always return cleanup callbacks for event subscriptions and timers.

---

### 4. Bundle Size & DOM Performance (MEDIUM-HIGH)

#### `fe-bundle-barrel-imports`
- **Impact:** MEDIUM-HIGH
- **Why:** Importing from the root index/barrel file of huge icon or utility packages bundles hundreds of unused modules into the client payload.
- **Incorrect:**
  ```typescript
  import { Check, AlertTriangle, ArrowRight } from 'lucide-react'; // Can bundle entire icon library!
  import { debounce } from 'lodash';
  ```
- **Correct:**
  ```typescript
  import Check from 'lucide-react/dist/esm/icons/check';
  import debounce from 'lodash/debounce';
  ```
- **Remedy:** Use direct subpath imports or configure bundler optimizePackageImports.

#### `fe-dom-virtualization`
- **Impact:** MEDIUM-HIGH
- **Why:** Rendering thousands of DOM nodes simultaneously leads to severe input latency, memory spikes, and poor Interaction to Next Paint (INP).
- **Incorrect:**
  ```tsx
  <div className="list">
    {items.map(item => <Row key={item.id} data={item} />)} {/* 5,000 DOM nodes! */}
  </div>
  ```
- **Correct:**
  ```tsx
  // Virtualized rendering (only viewport elements in DOM)
  <VirtualList items={items} itemHeight={40} renderItem={item => <Row data={item} />} />
  // Or CSS content-visibility for lightweight virtualization:
  // .row-item { content-visibility: auto; contain-intrinsic-size: 40px; }
  ```
- **Remedy:** Virtualize long lists using windowing libraries or `content-visibility: auto`.
