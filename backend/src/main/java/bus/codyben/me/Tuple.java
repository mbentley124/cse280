package bus.codyben.me;

public class Tuple<X, Y> { 
  
  public final X first; 
  
  public final Y second; 
  
  
  public Tuple(X first, Y second) { 
    this.first = first; 
    this.second = second; 
  }

  /**
   * @return the first
   */
  public X getFirst() {
    return first;
  }

  /**
   * @return the second
   */
  public Y getSecond() {
    return second;
  }
}