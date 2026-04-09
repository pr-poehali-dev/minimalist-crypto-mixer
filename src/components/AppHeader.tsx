import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from '@/components/ui/basic-dropdown';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AvatarWithName } from '@/components/ui/avatar-with-name';

import { OTPVerification } from '@/components/ui/otp-input';
import { GlassFilter } from '@/components/ui/liquid-radio';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const ADMIN_USERNAMES = ['@admin', '@cryptocurrency_mixer_bot', '@fafaker123'];

interface AppHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthenticated: boolean;
  telegramUsername: string;
  isCodeSent: boolean;
  authError: string;
  inputUsername: string;
  setInputUsername: (v: string) => void;
  setAuthError: (v: string) => void;
  onRequestCode: () => void | Promise<void>;
  onVerifyCode: (code: string) => Promise<void>;
  onResendCode: () => Promise<void>;
  onLogout: () => void;
}

const AppHeader = ({
  activeTab,
  setActiveTab,
  isAuthenticated,
  telegramUsername,
  isCodeSent,
  authError,
  inputUsername,
  setInputUsername,
  setAuthError,
  onRequestCode,
  onVerifyCode,
  onResendCode,
  onLogout,
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRequestCode = async () => {
    setAuthLoading(true);
    await onRequestCode();
    setAuthLoading(false);
  };

  const userDropdown = (showNav = false) => (
    <Dropdown>
      <DropdownTrigger className="cursor-pointer">
        <AvatarWithName
          name={telegramUsername}
          fallback={telegramUsername.slice(1, 3).toUpperCase()}
          size="sm"
          direction="left"
        />
      </DropdownTrigger>
      <DropdownContent align="end" className="w-56">
        {showNav && (
          <>
            <DropdownItem className="gap-2" onClick={() => setActiveTab('my-exchanges')}>
              <Icon name="ClipboardList" size={16} />
              Мои обмены
            </DropdownItem>
            <DropdownItem className="gap-2" onClick={() => setActiveTab('referral')}>
              <Icon name="Gift" size={16} />
              Партнёрство
            </DropdownItem>
            <DropdownItem className="gap-2" onClick={() => setActiveTab('support')}>
              <Icon name="Headphones" size={16} />
              Поддержка
            </DropdownItem>
            <DropdownItem className="gap-2" onClick={() => setActiveTab('faq')}>
              <Icon name="Info" size={16} />
              FAQ
            </DropdownItem>
          </>
        )}
        {ADMIN_USERNAMES.includes(telegramUsername.toLowerCase()) && (
          <>
            {showNav && <DropdownSeparator />}
            <DropdownItem className="gap-2" onClick={() => navigate('/admin')}>
              <Icon name="Settings" size={16} />
              Админ-панель
            </DropdownItem>
          </>
        )}
        {(showNav || ADMIN_USERNAMES.includes(telegramUsername.toLowerCase())) && <DropdownSeparator />}
        <DropdownItem className="gap-2" onClick={onLogout} destructive>
          <Icon name="LogOut" size={16} />
          Выйти
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );

  const rightSection = isAuthenticated ? (
    <>
      <div className="md:hidden">{userDropdown()}</div>
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">{userDropdown(true)}</div>
    </>
  ) : (
    <Popover open={authOpen} onOpenChange={setAuthOpen} modal>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs md:text-sm">
          Войти{' '}<span className="hidden md:inline">через Telegram</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="end"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        {!isCodeSent ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2 text-center">Вход через Telegram</h3>
            <p className="text-center text-gray-600 mb-4 text-sm">Введите username, мы отправим вам код</p>
            <div className="p-3 bg-blue-50 border border-blue-200 mb-4 text-xs text-blue-800">
              <p className="font-semibold mb-1">Первый раз?</p>
              <p>Сначала напишите <strong>/start</strong> нашему боту: <a href="https://t.me/blqou_auth_bot" target="_blank" rel="noopener noreferrer" className="underline font-semibold">@blqou_auth_bot</a></p>
            </div>
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 mb-4 text-xs text-red-700">{authError}</div>
            )}
            <div className="space-y-4">
              <Input
                ref={inputRef}
                placeholder="@username"
                value={inputUsername}
                onChange={(e) => { setInputUsername(e.target.value); setAuthError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && !authLoading && handleRequestCode()}
                className="border-gray-300 focus:border-blue-500 h-12"
              />
              <Button
                type="button"
                onClick={handleRequestCode}
                disabled={authLoading || !inputUsername.trim()}
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-lg"
              >
                {authLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Отправка...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Получить код
                    <Icon name="ArrowRight" size={16} />
                  </div>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-5">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 mb-4 text-xs text-red-700 rounded-lg">{authError}</div>
            )}
            <OTPVerification
              inputCount={4}
              onVerify={onVerifyCode}
              onResend={onResendCode}
              telegram_username={telegramUsername}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );

  return (
    <header className="border-b border-border/50">
      <div className="px-4 py-3 md:px-8 md:py-6 flex items-center justify-between h-[57px] md:h-[73px]">
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src="https://cdn.poehali.dev/projects/3306a222-60eb-449b-b09c-fcee64a12f0b/bucket/79514047-6e2d-4de5-98f0-ba9b9a9b2973.png" alt="BLQOU" className="h-8 md:h-10 w-auto" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            BLQOU
          </h1>
        </div>

        <div className="hidden md:inline-flex h-9 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-0.5 shadow-sm border border-blue-100 overflow-hidden">
          <RadioGroup
            value={activeTab}
            onValueChange={setActiveTab}
            className="group relative inline-grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-[16.666%] after:rounded-md after:bg-gradient-to-br after:from-blue-500 after:to-blue-600 after:shadow-[0_0_6px_rgba(59,130,246,0.4),0_2px_8px_rgba(59,130,246,0.3)] after:transition-all after:duration-500 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=exchange]:after:translate-x-0 data-[state=my-exchanges]:after:translate-x-[100%] data-[state=referral]:after:translate-x-[200%] data-[state=support]:after:translate-x-[300%] data-[state=about]:after:translate-x-[400%] data-[state=faq]:after:translate-x-[500%]"
            data-state={activeTab}
          >
            <div
              className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md pointer-events-none"
              style={{ filter: 'url("#radio-glass")' }}
            />
            <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=exchange]:text-white group-data-[state=exchange]:font-semibold">
              Обмен
              <RadioGroupItem id="tab-exchange-h" value="exchange" className="sr-only" />
            </label>
            <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=my-exchanges]:text-white group-data-[state=my-exchanges]:font-semibold">
              Мои обмены
              <RadioGroupItem id="tab-my-exchanges-h" value="my-exchanges" className="sr-only" />
            </label>
            <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=referral]:text-white group-data-[state=referral]:font-semibold">
              Партнёрство
              <RadioGroupItem id="tab-referral-h" value="referral" className="sr-only" />
            </label>
            <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=support]:text-white group-data-[state=support]:font-semibold">
              Поддержка
              <RadioGroupItem id="tab-support-h" value="support" className="sr-only" />
            </label>
            <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=about]:text-white group-data-[state=about]:font-semibold">
              О нас
              <RadioGroupItem id="tab-about-h" value="about" className="sr-only" />
            </label>
            <label className="relative z-10 inline-flex h-full min-w-[70px] cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-xs text-gray-600 group-data-[state=faq]:text-white group-data-[state=faq]:font-semibold">
              FAQ
              <RadioGroupItem id="tab-faq-h" value="faq" className="sr-only" />
            </label>
            <GlassFilter />
          </RadioGroup>
        </div>

        {rightSection}
      </div>
    </header>
  );
};

export default AppHeader;