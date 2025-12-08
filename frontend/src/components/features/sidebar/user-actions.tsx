import React from "react";
import { UserAvatar } from "./user-avatar";
import { AccountSettingsContextMenu } from "../context-menu/account-settings-context-menu";
import { useShouldShowUserFeatures } from "#/hooks/use-should-show-user-features";
import { cn } from "#/utils/utils";
import { useConfig } from "#/hooks/query/use-config";

interface UserActionsProps {
  onLogout: () => void;
  user?: { avatar_url: string };
  isLoading?: boolean;
}

export function UserActions({ onLogout, user, isLoading }: UserActionsProps) {
  const [accountContextMenuIsVisible, setAccountContextMenuIsVisible] =
    React.useState(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const { data: config } = useConfig();

  // Use the shared hook to determine if user actions should be shown
  const shouldShowUserActions = useShouldShowUserFeatures();

  const toggleAccountMenu = () => {
    // Always toggle the menu, even if user is undefined
    setAccountContextMenuIsVisible((prev) => !prev);
  };

  const closeAccountMenu = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setAccountContextMenuIsVisible(false);
    }, 350);
  };

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = undefined;
    }
  };

  const handleLogout = () => {
    onLogout();
    closeAccountMenu();
  };

  const isOSS = config?.APP_MODE === "oss";

  // Show the menu based on the new logic
  const showMenu =
    accountContextMenuIsVisible && (shouldShowUserActions || isOSS);

  return (
    <div
      data-testid="user-actions"
      className="w-8 h-8 relative cursor-pointer"
      onMouseEnter={() => {
        cancelClose();
        setAccountContextMenuIsVisible(true);
      }}
      onMouseLeave={closeAccountMenu}
    >
      <UserAvatar
        avatarUrl={user?.avatar_url}
        onClick={toggleAccountMenu}
        isLoading={isLoading}
      />

      {(shouldShowUserActions || isOSS) && (
        <div
          className={cn(
            "opacity-0 pointer-events-none transition-opacity duration-200",
            showMenu && "opacity-100 pointer-events-auto",
          )}
          onMouseEnter={() => {
            cancelClose();
            setAccountContextMenuIsVisible(true);
          }}
          onMouseLeave={closeAccountMenu}
        >
          <AccountSettingsContextMenu
            onLogout={handleLogout}
            onClose={closeAccountMenu}
          />
        </div>
      )}
    </div>
  );
}
