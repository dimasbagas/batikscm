import 'package:flutter_test/flutter_test.dart';
import 'package:batikchain_mobile/main.dart';

void main() {
  testWidgets('App loads login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const BatikChainApp());
    await tester.pumpAndSettle();
    expect(find.text('Masuk'), findsOneWidget);
  });
}
