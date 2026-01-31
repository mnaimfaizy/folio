/* eslint-disable react-native/no-raw-text */
/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Avatar,
  Card,
  Divider,
  IconButton,
  List,
  Button as PaperButton,
  Paragraph,
  Surface,
  Text,
  Title,
} from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function HomeScreen() {
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Surface style={styles.header} elevation={1}>
        <Avatar.Text
          size={64}
          label={(user?.name?.[0] || 'R').toUpperCase()}
          style={styles.avatar}
        />
        <View style={styles.headerTextContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome, {user?.name || 'Reader'}!
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Discover our library collection and manage your borrowed books.
          </Text>
        </View>
      </Surface>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Library Services</Title>
          <List.Section>
            <List.Item
              title="Browse our collection"
              left={props => <List.Icon {...props} icon="book-multiple" />}
            />
            <List.Item
              title="Check out and return books"
              left={props => <List.Icon {...props} icon="book-arrow-right" />}
            />
            <List.Item
              title="Manage your reading history"
              left={props => <List.Icon {...props} icon="history" />}
            />
            <List.Item
              title="Get personalized recommendations"
              left={props => <List.Icon {...props} icon="star" />}
            />
          </List.Section>
        </Card.Content>
        <Card.Actions>
          <PaperButton mode="contained-tonal" onPress={() => {}}>
            <Text>Explore Services</Text>
          </PaperButton>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Cover source={require('../../assets/images/icon.png')} />
        <Card.Content>
          <Title>New Arrivals</Title>
          <Paragraph>
            Check out our latest books and stay updated with new additions to our library.
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <PaperButton mode="outlined" onPress={() => {}}>
            View All
          </PaperButton>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.popularBooksHeader}>
            <Title>Popular Books</Title>
            <IconButton icon="arrow-right" size={24} onPress={() => {}} />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.popularBooks}>
            <Surface style={styles.bookItem} elevation={2}>
              <Text variant="titleMedium">The Great Gatsby</Text>
              <Text variant="bodySmall">F. Scott Fitzgerald</Text>
            </Surface>
            <Surface style={styles.bookItem} elevation={2}>
              <Text variant="titleMedium">To Kill a Mockingbird</Text>
              <Text variant="bodySmall">Harper Lee</Text>
            </Surface>
            <Surface style={styles.bookItem} elevation={2}>
              <Text variant="titleMedium">1984</Text>
              <Text variant="bodySmall">George Orwell</Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  avatar: {
    marginRight: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 12,
  },
  popularBooksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularBooks: {
    marginTop: 8,
  },
  bookItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
});
