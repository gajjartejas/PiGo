import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerStyle: {},
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContainer: {
    paddingBottom: 100,
  },
  subView: {
    marginHorizontal: 8,
    flex: 1,
  },
  noDataButtonsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  emptyView: {
    marginHorizontal: 20,
  },
  fab: {
    position: 'absolute',
    right: 16,
  },
  cardTablet: {
    width: '70%',
    alignSelf: 'center',
  },
  navigationButton: {
    marginHorizontal: 16,
  },
  subTitleTextStyle: {
    fontSize: 12,
    fontWeight: '400',
  },
  subTitleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -20,
  },
});

export default styles;
