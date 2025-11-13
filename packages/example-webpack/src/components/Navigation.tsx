import React from 'react';

export interface Tab {
  id: string;
  label: string;
  description: string;
}

interface NavigationProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Tab[];
}

/**
 * Navigation component for switching between API examples
 */
const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange, tabs }) => {
  return (
    <nav className="navigation">
      <div className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
            aria-pressed={currentTab === tab.id}
          >
            <span className="nav-tab-label">{tab.label}</span>
            <span className="nav-tab-description">{tab.description}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
