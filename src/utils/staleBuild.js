/**
 * Recovery from a stale build.
 *
 * Every deploy publishes a new index.html pointing at freshly hashed assets.
 * A tab that was open across the deploy is still running the old document, and
 * its service worker may have the old document cached, so the first thing it
 * asks for after the swap — a lazy route chunk, usually — comes back 404 and
 * the app blanks or trips the error boundary.
 *
 * The fix is to throw away everything the old build left behind and load the
 * page again. Once per tab: if the reload lands on the same failure we show the
 * error screen instead of refreshing forever.
 */

const FLAG = "me:stale-build-recovered";

/** True when the error is a build that moved underneath us, not a real bug. */
export function looksLikeStaleBuild(error) {
  if (!error) return false;
  const text = `${error.name || ""} ${error.message || ""}`;
  return (
    /ChunkLoadError/i.test(text) ||
    /Loading (CSS )?chunk .* failed/i.test(text) ||
    /Failed to fetch dynamically imported module/i.test(text) ||
    /error loading dynamically imported module/i.test(text) ||
    /Importing a module script failed/i.test(text) ||
    /'text\/html' is not a valid JavaScript MIME type/i.test(text)
  );
}

/**
 * Clear caches and workers, then reload. Returns false when recovery has
 * already been tried in this tab, so the caller can fall back to the UI.
 */
export async function recoverFromStaleBuild({ force = false } = {}) {
  if (!force) {
    try {
      if (sessionStorage.getItem(FLAG) === "1") return false;
      sessionStorage.setItem(FLAG, "1");
    } catch {
      // Private windows and some in-app webviews reject storage. Without the
      // guard a reload loop is possible, so leave it to the error screen.
      return false;
    }
  }

  try {
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
    }
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(reg => reg.unregister()));
    }
  } catch (err) {
    console.warn("[stale build] teardown failed, reloading anyway:", err);
  }

  window.location.reload();
  return true;
}

/** Let a tab that recovered and then ran fine try again on a future deploy. */
export function clearStaleBuildFlag() {
  try {
    sessionStorage.removeItem(FLAG);
  } catch {
    /* storage unavailable — nothing to clear */
  }
}
