import { useRef, useState, useEffect } from "react";
import { FlatList, View, Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export default function AppCarousel({
  children,
  autoSlide = true,
  interval = 3000,
  slideWidth = width,
  showDots = true,
  dotColor = "#ccc",
  activeDotColor = "#2E7D32",
}) {
  const flatListRef = useRef(null);
  const intervalRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = Array.isArray(children) ? children : [children];

  const stopAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startAutoSlide = () => {
    if (!autoSlide || slides.length <= 1) return;

    stopAutoSlide();

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev === slides.length - 1 ? 0 : prev + 1;

        flatListRef.current?.scrollToIndex({
          index: next,
          animated: true,
        });

        return next;
      });
    }, interval);
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  return (
    <View
      style={{
        width: slideWidth,
        alignSelf: "center",
      }}
    >
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onTouchStart={stopAutoSlide}
        onTouchEnd={startAutoSlide}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / slideWidth,
          );
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={{ width: slideWidth }}>{item}</View>
        )}
      />

      {showDots && slides.length > 1 && (
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    activeIndex === index ? activeDotColor : dotColor,
                  width: activeIndex === index ? 18 : 8,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  dot: {
    height: 8,
    margin: 4,
    borderRadius: 4,
  },
});
