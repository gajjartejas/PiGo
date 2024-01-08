import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerStyle: {},
  safeArea: {
    flex: 1,
  },
  scrollView: {},
  scrollViewContainer: {
    paddingBottom: 100,
  },
  subView: {
    marginHorizontal: 8,
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalView: {
    justifyContent: 'space-around',
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 20,
  },
  textSize: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 16,
  },
  inputStyle: {
    borderBottomWidth: 1,
    width: '100%',
    height: 50,
  },
  inputStyleBottom: {
    marginBottom: 16,
  },
  textInputShadow: {},
  buttonContainer: {
    flexDirection: 'row',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginTop: 16,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    marginLeft: 4,
  },
  advanceSettingText: {
    fontSize: 12,
    alignSelf: 'flex-end',
    minHeight: 20,
  },
  bottomErrorMessage: {
    fontSize: 12,
    marginBottom: 16,
  },
  touchableAdvanceSetting: {
    marginVertical: 8,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  spacing: {
    width: 8,
  },
  selectPiAppServer: {
    marginHorizontal: -16,
  },
  bottomMargin: {
    marginBottom: 8,
  },
  noDataButtonsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  cardTablet: {
    width: '70%',
    alignSelf: 'center',
  },
  activityIndicatorStyle: {
    flex: 1,
    position: 'absolute',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  separator: {
    width: '90%',
    height: 1,
    alignSelf: 'center',
  },
  webview: {
    flex: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  navigationButton: {
    marginHorizontal: 8,
  },
  homeBackFwdButtonContainer: {
    flexDirection: 'row',
  },
  docker: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dockerLoadingProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    top: 0,
    right: 0,
    zIndex: 10,
    height: 50,
    overflow: 'hidden',
    borderRadius: 25,
    backgroundColor: 'transparent',
  },
});

export default styles;
