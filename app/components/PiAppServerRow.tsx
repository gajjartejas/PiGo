import React, { memo } from 'react';

//ThirdParty
import { IconButton, List, Menu } from 'react-native-paper';

//App modules
import PiAppServer from 'app/models/models/piAppServer';
import { useTranslation } from 'react-i18next';

//Interface
interface IPiAppServerRowProps {
  onPressPiAppServer: (item: PiAppServer, index: number, sectionIndex: number) => void;
  openMenu: (item: PiAppServer, index: number, sectionIndex: number) => void;
  onPressEditMenu: (item: PiAppServer, index: number, sectionIndex: number) => void;
  onPressDeleteMenu: (item: PiAppServer, index: number, sectionIndex: number) => void;
  onPressInfoMenu: (item: PiAppServer, index: number, sectionIndex: number) => void;
  closeMenu: () => void;
  index: number;
  sectionIndex: number;
  visibleIndex: number | null;
  visibleSectionIndex: number | null;
  item: PiAppServer;
}

function PiAppServerRow(props: IPiAppServerRowProps) {
  //Const
  const { t } = useTranslation();
  const {
    onPressPiAppServer,
    item,
    sectionIndex,
    index,
    visibleSectionIndex,
    visibleIndex,
    openMenu,
    closeMenu,
    onPressEditMenu,
    onPressDeleteMenu,
    onPressInfoMenu,
  } = props;

  return (
    <List.Item
      onPress={() => onPressPiAppServer(item, sectionIndex, index)}
      title={item.name}
      description={`${item.path}:${item.port}`}
      left={p => <List.Icon {...p} icon="web" />}
      right={p => (
        <Menu
          visible={visibleIndex === index && visibleSectionIndex === sectionIndex}
          onDismiss={closeMenu}
          anchor={
            <IconButton {...p} size={16} icon={'dots-vertical'} onPress={() => openMenu(item, sectionIndex, index)} />
          }>
          <Menu.Item
            leadingIcon="pencil"
            onPress={() => {
              onPressEditMenu(item, sectionIndex, index);
            }}
            title={t('piAppServersList.edit')}
          />
          <Menu.Item
            leadingIcon="delete"
            onPress={() => {
              onPressDeleteMenu(item, sectionIndex, index);
            }}
            title={t('piAppServersList.delete')}
          />
          <Menu.Item
            leadingIcon="information"
            onPress={() => {
              onPressInfoMenu(item, sectionIndex, index);
            }}
            title={t('piAppServersList.info')}
          />
        </Menu>
      )}
    />
  );
}

export default memo(PiAppServerRow);
