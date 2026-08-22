import { APP_NAVIGATION_ITEMS } from '../AppShell.const';
import type { SchoolCapabilities } from '../AppShell.types';

export function getVisibleNavigationItems(capabilities: SchoolCapabilities) {
  return APP_NAVIGATION_ITEMS.filter((item) => (
    !item.requiredCapability || capabilities[item.requiredCapability]
  ));
}
